import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react"
import "./App.css"

interface ProcessInfo {
    id: String,
    name: String
}

const App: React.FC = () => {
    const [osName, setOsName] = useState<string>("");
    const [processes, setProcesses] = useState<ProcessInfo[]>([]);

    async function fetchData() {
        const osName = await invoke<string>("get_os_name");
        const processList = await invoke<ProcessInfo[]>("list_processes");

        setOsName(osName);
        setProcesses(processList);
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function killProcess(id: String) {
        const success = await invoke<boolean>("kill_by_id", { id })

        if (success) {
            fetchData();
        }
    }

    return (
        <main className="container">
            <h2>Operating System: {osName}</h2>
            <div className="process-list">
                {processes.map((process) => (
                    <div key={process.id as string} className="process-item">
                        <span>{process.name} (ID: {process.id})</span>
                        <button onClick={() => killProcess(process.id)}>Kill</button>
                    </div>
                ))
                }
            </div>

        </main>
    )
}

export default App;
