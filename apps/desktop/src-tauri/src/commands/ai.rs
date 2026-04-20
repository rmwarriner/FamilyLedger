use serde::{Deserialize, Serialize};
use tracing::debug;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AiRequest {
    pub provider: String,
    pub model: String,
    pub prompt: String,
}

#[derive(Debug, Serialize)]
pub struct AiResponse {
    pub text: String,
}

#[tauri::command]
pub async fn ask_ai(request: AiRequest) -> Result<AiResponse, String> {
    debug!(
        command = "ask_ai",
        provider = request.provider.as_str(),
        model = request.model.as_str(),
        prompt_chars = request.prompt.len(),
        "IPC command entry"
    );
    // TODO(impl): dispatch request to configured provider with scrubbed ledger context.
    Ok(AiResponse {
        text: "TODO(impl): AI response".to_string(),
    })
}
