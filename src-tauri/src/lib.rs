// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::env;

use serde::{Deserialize, Serialize};
use sysinfo::System;

#[tauri::command]
async fn get_os_name() -> Result<&'static str, String> {
    Ok(env::consts::OS)
}

#[derive(Debug, Serialize, Deserialize)]
struct ProcessInfo {
    id: String,
    name: String,
}

#[tauri::command]
async fn list_processes() -> Result<Vec<ProcessInfo>, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let processes = sys
        .processes()
        .iter()
        .map(|(id, process)| ProcessInfo {
            id: id.to_string(),
            name: process.name().to_string_lossy().to_lowercase(),
        })
        .collect();

    Ok(processes)
}

#[tauri::command]
async fn kill_by_id(id: &str) -> Result<bool, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    Ok(sys
        .processes()
        .iter()
        .find(|(&pid, _)| pid.to_string().eq_ignore_ascii_case(id))
        .is_some_and(|(_, process)| {
            println!("Killed {}", process.name().to_string_lossy().to_lowercase());
            process.kill()
        }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_os_name,
            list_processes,
            kill_by_id,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
