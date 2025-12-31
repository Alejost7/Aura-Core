use rusqlite::Connection;
use std::path::PathBuf;

pub fn open_conn(path: &PathBuf) -> Result<Connection, String> {
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    conn.execute_batch(
        "
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        "
    ).map_err(|e| e.to_string())?;
    Ok(conn)
}
