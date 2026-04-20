use std::sync::{Mutex, OnceLock};

use uuid::Uuid;

#[derive(Clone, Debug)]
pub struct AccountRecord {
    pub id: String,
    pub name: String,
    pub full_path: String,
    pub currency: String,
    pub account_type: String,
}

#[derive(Clone, Debug)]
pub struct TransactionRecord {
    pub id: String,
    pub date: String,
    pub description: String,
    pub payee: Option<String>,
    pub amount: String,
    pub currency: String,
    pub debit_account_id: String,
    pub debit_account_name: String,
    pub credit_account_id: String,
    pub credit_account_name: String,
    pub memo: Option<String>,
    pub is_scheduled: bool,
    pub scheduled_id: Option<String>,
}

#[derive(Debug)]
pub struct CreateTransactionInput {
    pub date: String,
    pub description: String,
    pub payee: Option<String>,
    pub amount: String,
    pub debit_account_id: String,
    pub credit_account_id: String,
    pub memo: Option<String>,
    pub scheduled_id: Option<String>,
}

#[derive(Clone, Debug)]
pub struct ScheduledRecord {
    pub id: String,
    pub due_at: String,
    pub auto_post: bool,
    pub description: String,
    pub amount: String,
    pub debit_account_id: String,
    pub credit_account_id: String,
    pub memo: Option<String>,
}

#[derive(Default)]
struct LedgerStore {
    accounts: Vec<AccountRecord>,
    transactions: Vec<TransactionRecord>,
    scheduled: Vec<ScheduledRecord>,
}

impl LedgerStore {
    fn with_seed_data() -> Self {
        Self {
            accounts: vec![
                AccountRecord {
                    id: "acct-checking".to_string(),
                    name: "Checking".to_string(),
                    full_path: "Assets:Checking".to_string(),
                    currency: "USD".to_string(),
                    account_type: "ASSET".to_string(),
                },
                AccountRecord {
                    id: "acct-cash".to_string(),
                    name: "Cash".to_string(),
                    full_path: "Assets:Cash".to_string(),
                    currency: "USD".to_string(),
                    account_type: "ASSET".to_string(),
                },
                AccountRecord {
                    id: "acct-groceries".to_string(),
                    name: "Groceries".to_string(),
                    full_path: "Expenses:Groceries".to_string(),
                    currency: "USD".to_string(),
                    account_type: "EXPENSE".to_string(),
                },
                AccountRecord {
                    id: "acct-income".to_string(),
                    name: "Income".to_string(),
                    full_path: "Income:Salary".to_string(),
                    currency: "USD".to_string(),
                    account_type: "INCOME".to_string(),
                },
                AccountRecord {
                    id: "acct-rent".to_string(),
                    name: "Rent".to_string(),
                    full_path: "Expenses:Rent".to_string(),
                    currency: "USD".to_string(),
                    account_type: "EXPENSE".to_string(),
                },
            ],
            transactions: Vec::new(),
            scheduled: vec![
                ScheduledRecord {
                    id: "sched-rent".to_string(),
                    due_at: "2026-04-01".to_string(),
                    auto_post: false,
                    description: "Monthly Rent".to_string(),
                    amount: "1200.00".to_string(),
                    debit_account_id: "acct-rent".to_string(),
                    credit_account_id: "acct-checking".to_string(),
                    memo: Some("Landlord payment".to_string()),
                },
                ScheduledRecord {
                    id: "sched-grocery-topup".to_string(),
                    due_at: "2026-04-25".to_string(),
                    auto_post: true,
                    description: "Weekly Grocery Budget".to_string(),
                    amount: "85.00".to_string(),
                    debit_account_id: "acct-groceries".to_string(),
                    credit_account_id: "acct-checking".to_string(),
                    memo: None,
                },
            ],
        }
    }
}

fn shared_store() -> &'static Mutex<LedgerStore> {
    static STORE: OnceLock<Mutex<LedgerStore>> = OnceLock::new();
    STORE.get_or_init(|| Mutex::new(LedgerStore::with_seed_data()))
}

pub fn list_accounts() -> Vec<AccountRecord> {
    let store = shared_store()
        .lock()
        .expect("ledger store lock");
    store.accounts.clone()
}

pub fn list_transactions() -> Vec<TransactionRecord> {
    let store = shared_store()
        .lock()
        .expect("ledger store lock");

    let mut transactions = store.transactions.clone();
    transactions.reverse();
    transactions
}

pub fn create_transaction(input: CreateTransactionInput) -> Result<TransactionRecord, String> {
    let parsed_amount = input
        .amount
        .trim()
        .parse::<f64>()
        .map_err(|_| "TRANSACTION_INVALID_AMOUNT".to_string())?;
    if parsed_amount <= 0.0 {
        return Err("TRANSACTION_INVALID_AMOUNT".to_string());
    }

    if input.debit_account_id == input.credit_account_id {
        return Err("TRANSACTION_ACCOUNTS_MUST_DIFFER".to_string());
    }

    let mut store = shared_store()
        .lock()
        .map_err(|_| "TRANSACTION_STORE_LOCK_FAILED".to_string())?;

    let debit = store
        .accounts
        .iter()
        .find(|account| account.id == input.debit_account_id)
        .ok_or_else(|| "TRANSACTION_DEBIT_ACCOUNT_NOT_FOUND".to_string())?
        .clone();
    let credit = store
        .accounts
        .iter()
        .find(|account| account.id == input.credit_account_id)
        .ok_or_else(|| "TRANSACTION_CREDIT_ACCOUNT_NOT_FOUND".to_string())?
        .clone();

    if debit.currency != credit.currency {
        return Err("TRANSACTION_CURRENCY_MISMATCH".to_string());
    }

    let record = TransactionRecord {
        id: format!("txn-{}", Uuid::new_v4()),
        date: input.date.trim().to_string(),
        description: input.description.trim().to_string(),
        payee: input.payee.and_then(|value| {
            let trimmed = value.trim().to_string();
            if trimmed.is_empty() {
                None
            } else {
                Some(trimmed)
            }
        }),
        amount: format!("{parsed_amount:.2}"),
        currency: debit.currency,
        debit_account_id: debit.id,
        debit_account_name: debit.name,
        credit_account_id: credit.id,
        credit_account_name: credit.name,
        memo: input.memo.and_then(|value| {
            let trimmed = value.trim().to_string();
            if trimmed.is_empty() {
                None
            } else {
                Some(trimmed)
            }
        }),
        is_scheduled: input.scheduled_id.is_some(),
        scheduled_id: input.scheduled_id,
    };

    store.transactions.push(record.clone());
    Ok(record)
}

pub fn list_scheduled() -> Vec<ScheduledRecord> {
    let store = shared_store().lock().expect("ledger store lock");
    store.scheduled.clone()
}

pub fn post_scheduled(id: &str) -> Result<String, String> {
    let scheduled = {
        let store = shared_store().lock().map_err(|_| "TRANSACTION_STORE_LOCK_FAILED".to_string())?;
        store
            .scheduled
            .iter()
            .find(|item| item.id == id)
            .cloned()
            .ok_or_else(|| "SCHEDULED_TRANSACTION_NOT_FOUND".to_string())?
    };

    let created = create_transaction(CreateTransactionInput {
        date: chrono::Utc::now().date_naive().to_string(),
        description: format!("Scheduled: {}", scheduled.description),
        payee: None,
        amount: scheduled.amount,
        debit_account_id: scheduled.debit_account_id,
        credit_account_id: scheduled.credit_account_id,
        memo: scheduled.memo,
        scheduled_id: Some(scheduled.id),
    })?;

    Ok(created.id)
}

#[cfg(test)]
pub fn reset_for_tests() {
    let mut store = shared_store()
        .lock()
        .expect("ledger store lock");
    *store = LedgerStore::with_seed_data();
}
