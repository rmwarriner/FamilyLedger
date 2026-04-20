use regex::Regex;
use std::io::{self, Stdout, Write};
use tracing_subscriber::fmt::MakeWriter;

fn account_number_regex() -> Regex {
    Regex::new(r"\b\d{10,17}\b").expect("valid account number regex")
}

fn routing_number_regex() -> Regex {
    Regex::new(r"\b\d{9}\b").expect("valid routing number regex")
}

fn ssn_regex() -> Regex {
    Regex::new(r"\b\d{3}-\d{2}-\d{4}\b").expect("valid ssn regex")
}

fn email_regex() -> Regex {
    Regex::new(r"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b").expect("valid email regex")
}

pub fn scrub_pii(input: &str) -> String {
    let account_scrubbed = account_number_regex().replace_all(input, "[REDACTED_ACCOUNT]");
    let routing_scrubbed =
        routing_number_regex().replace_all(&account_scrubbed, "[REDACTED_ROUTING]");
    let ssn_scrubbed = ssn_regex().replace_all(&routing_scrubbed, "[REDACTED_SSN]");
    email_regex()
        .replace_all(&ssn_scrubbed, "[REDACTED_EMAIL]")
        .to_string()
}

#[derive(Clone, Debug, Default)]
pub struct ScrubbedStdout;

pub struct ScrubbedWriter {
    inner: Stdout,
}

impl<'a> MakeWriter<'a> for ScrubbedStdout {
    type Writer = ScrubbedWriter;

    fn make_writer(&'a self) -> Self::Writer {
        ScrubbedWriter {
            inner: io::stdout(),
        }
    }
}

impl Write for ScrubbedWriter {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        let text = String::from_utf8_lossy(buf);
        let scrubbed = scrub_pii(&text);
        self.inner.write_all(scrubbed.as_bytes())?;
        Ok(buf.len())
    }

    fn flush(&mut self) -> io::Result<()> {
        self.inner.flush()
    }
}

#[cfg(test)]
mod tests {
    use super::scrub_pii;

    #[test]
    fn scrubs_security_model_sensitive_patterns() {
        let input =
            "acct 123456789012 routing 021000021 ssn 123-45-6789 email jane.doe@example.com";
        let output = scrub_pii(input);
        assert!(output.contains("[REDACTED_ACCOUNT]"));
        assert!(output.contains("[REDACTED_ROUTING]"));
        assert!(output.contains("[REDACTED_SSN]"));
        assert!(output.contains("[REDACTED_EMAIL]"));
    }
}
