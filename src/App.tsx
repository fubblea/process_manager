import { invoke } from "@tauri-apps/api/core";
import { motion, AnimatePresence } from "framer-motion";
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
        <main className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">
                Operating System: <span className="font-bold">{osName}</span>
            </h2>

            <div className="space-y-3">
                <AnimatePresence initial={false}>
                    {processes.map((process) => (
                        <motion.div
                            key={process.id as string}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-2xl shadow p-4"
                        >
                            <span className="truncate">
                                {process.name}
                                <span className="text-xs text-zinc-500"> (ID: {process.id})</span>
                            </span>
                            <button
                                onClick={() => killProcess(process.id)}
                                className="ml-4 shrink-0 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                            >
                                Kill
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </main>
    )
}

export default App;
