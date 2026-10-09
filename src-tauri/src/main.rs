#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    if std::env::args_os().any(|argument| argument == "--purge-user-data") {
        if rabbit_desk_pet_lib::purge_installed_user_data().is_err() {
            std::process::exit(1);
        }
        return;
    }
    rabbit_desk_pet_lib::run()
}
