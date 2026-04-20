pub mod audit;
pub mod commands;
pub mod crypto;
pub mod db;
pub mod logging;
pub mod sync;

use tracing_subscriber::EnvFilter;

fn init_tracing() {
    let _ = tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::new("debug"))
        .with_writer(logging::ScrubbedStdout)
        .with_target(true)
        .try_init();
}

pub fn run() {
    init_tracing();

    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            db::connection::initialize_sqlite(&handle)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::accounts::list_accounts,
            commands::transactions::list_transactions,
            commands::transactions::create_transaction,
            commands::scheduled::list_scheduled_transactions,
            commands::scheduled::post_scheduled_transaction,
            commands::budgets::list_budgets,
            commands::reports::run_report,
            commands::imports::import_data,
            commands::sync::poll_sync_status,
            commands::sync::sync_now,
            commands::audit::verify_audit_integrity,
            commands::audit::query_audit_log,
            commands::pairing::begin_pairing,
            commands::pairing::complete_pairing,
            commands::ai::ask_ai,
            commands::vault::unlock_vault
        ])
        .run(tauri::generate_context!())
        .expect("failed to run FamilyLedger application");
}
