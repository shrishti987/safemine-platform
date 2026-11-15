import { useMemo, useState } from "react";
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Search,
  HardHat,
  Plus,
} from "lucide-react";
import Modal from "../components/common/Modal";

const initialMaintenanceData = [
  {
    id: "MT-001",
    device: "HLM-004",
    worker: "Aman Rawat",
    issue: "Gas sensor calibration required",
    priority: "High",
    status: "In Progress",
    technician: "Rajesh Kumar",
    due: "Today",
  },
  {
    id: "MT-002",
    device: "HLM-007",
    worker: "Naveen Rana",
    issue: "Battery cell replacement (<30%)",
    priority: "Medium",
    status: "Scheduled",
    technician: "Vikas Singh",
    due: "Tomorrow",
  },
  {
    id: "MT-003",
    device: "HLM-003",
    worker: "Vikas Negi",
    issue: "Thermal shield & vent inspection",
    priority: "Medium",
    status: "Scheduled",
    technician: "Amit Negi",
    due: "Next shift",
  },
  {
    id: "MT-004",
    device: "HLM-006",
    worker: "Karan Bisht",
    issue: "Firmware v2.4 update",
    priority: "Low",
    status: "Completed",
    technician: "Rajesh Kumar",
    due: "Completed",
  },
  {
    id: "MT-005",
    device: "HLM-005",
    worker: "Deepak Joshi",
    issue: "LoRa antenna connectivity check",
    priority: "Low",
    status: "Completed",
    technician: "Amit Negi",
    due: "Completed",
  },
];

function Maintenance() {
  const [tasks, setTasks] = useState(initialMaintenanceData);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    device: "HLM-001",
    worker: "Arjun Singh",
    issue: "",
    priority: "Medium",
    technician: "Rajesh Kumar",
    due: "Tomorrow",
  });

  const filteredTasks = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return tasks;

    return tasks.filter(
      (item) =>
        item.id.toLowerCase().includes(search) ||
        item.device.toLowerCase().includes(search) ||
        item.worker.toLowerCase().includes(search) ||
        item.issue.toLowerCase().includes(search) ||
        item.technician.toLowerCase().includes(search)
    );
  }, [tasks, query]);

  const openTasks = tasks.filter((t) => t.status !== "Completed").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "In Progress"
  ).length;
  const dueTodayTasks = tasks.filter(
    (t) => t.due === "Today" && t.status !== "Completed"
  ).length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  const cycleStatus = (taskId) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const nextStatus =
          task.status === "Scheduled"
            ? "In Progress"
            : task.status === "In Progress"
              ? "Completed"
              : "Scheduled";
        return {
          ...task,
          status: nextStatus,
          due: nextStatus === "Completed" ? "Completed" : task.due === "Completed" ? "Today" : task.due,
        };
      })
    );
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.issue.trim()) return;
    const nextNum = String(tasks.length + 1).padStart(3, "0");
    setTasks((prev) => [
      {
        id: `MT-${nextNum}`,
        device: newTask.device,
        worker: newTask.worker,
        issue: newTask.issue.trim(),
        priority: newTask.priority,
        status: "Scheduled",
        technician: newTask.technician,
        due: newTask.due,
      },
      ...prev,
    ]);
    setNewTask({
      device: "HLM-001",
      worker: "Arjun Singh",
      issue: "",
      priority: "Medium",
      technician: "Rajesh Kumar",
      due: "Tomorrow",
    });
    setModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-[1700px] space-y-5">
      {/* HEADER */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-400">
          Device Management
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">Maintenance</h1>
        <p className="mt-1 text-xs text-slate-400">
          Track smart helmet maintenance, calibrations, repairs, and scheduled inspections.
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Open Tasks
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400/10">
              <Wrench size={18} className="text-orange-400" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{openTasks}</p>
          <p className="mt-1 text-xs text-slate-400">Active queue</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              In Progress
            </p>
            <Clock3 size={18} className="text-cyan-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-cyan-400">
            {inProgressTasks}
          </p>
          <p className="mt-1 text-xs text-slate-400">Currently being serviced</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Due Today
            </p>
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-400">
            {dueTodayTasks}
          </p>
          <p className="mt-1 text-xs text-slate-400">Requires attention</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Completed
            </p>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-400">
            {completedTasks}
          </p>
          <p className="mt-1 text-xs text-slate-400">Verified inspections</p>
        </div>
      </div>

      {/* SEARCH + ACTION */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#0c121c] p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex h-10 max-w-md flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search task, helmet, technician..."
            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-orange-400"
        >
          <Plus size={15} />
          Create Maintenance Task
        </button>
      </div>

      {/* MAINTENANCE TABLE */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c121c]">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Maintenance Schedule
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Click any task status button to advance its progress
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="border-b border-white/[0.05] text-left">
                {[
                  "Task",
                  "Device",
                  "Issue",
                  "Priority",
                  "Status",
                  "Technician",
                  "Due",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredTasks.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-8 text-center text-xs text-slate-400"
                  >
                    No maintenance tasks match your search.
                  </td>
                </tr>
              )}

              {filteredTasks.map((item) => {
                const high = item.priority === "High";
                const medium = item.priority === "Medium";
                const completed = item.status === "Completed";
                const progress = item.status === "In Progress";

                return (
                  <tr
                    key={item.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            completed
                              ? "bg-emerald-400/10"
                              : high
                                ? "bg-red-400/10"
                                : "bg-orange-400/10"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2
                              size={16}
                              className="text-emerald-400"
                            />
                          ) : (
                            <Wrench
                              size={16}
                              className={
                                high ? "text-red-400" : "text-orange-400"
                              }
                            />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-white">
                            {item.id}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.worker}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5">
                      <div className="flex items-center gap-2">
                        <HardHat size={14} className="text-cyan-400" />
                        <span className="text-xs text-slate-300">
                          {item.device}
                        </span>
                      </div>
                    </td>

                    <td className="px-5">
                      <p className="max-w-[240px] text-xs text-slate-300">
                        {item.issue}
                      </p>
                    </td>

                    <td className="px-5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          high
                            ? "bg-red-400/15 text-red-400"
                            : medium
                              ? "bg-amber-400/15 text-amber-400"
                              : "bg-slate-400/15 text-slate-300"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    <td className="px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          completed
                            ? "bg-emerald-400/15 text-emerald-400"
                            : progress
                              ? "bg-cyan-400/15 text-cyan-400"
                              : "bg-orange-400/15 text-orange-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            completed
                              ? "bg-emerald-400"
                              : progress
                                ? "bg-cyan-400"
                                : "bg-orange-400"
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5">
                      <p className="text-xs text-slate-300">
                        {item.technician}
                      </p>
                    </td>

                    <td className="px-5">
                      <span
                        className={`text-xs ${
                          item.due === "Today"
                            ? "font-semibold text-red-400"
                            : completed
                              ? "text-emerald-400"
                              : "text-slate-400"
                        }`}
                      >
                        {item.due}
                      </span>
                    </td>

                    <td className="px-5">
                      <button
                        type="button"
                        onClick={() => cycleStatus(item.id)}
                        className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        {completed
                          ? "Reopen"
                          : progress
                            ? "Mark Done"
                            : "Start"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Maintenance Task"
        size="md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-400">
                Helmet ID
              </label>
              <input
                type="text"
                value={newTask.device}
                onChange={(e) =>
                  setNewTask((p) => ({ ...p, device: e.target.value }))
                }
                className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-400">
                Worker
              </label>
              <input
                type="text"
                value={newTask.worker}
                onChange={(e) =>
                  setNewTask((p) => ({ ...p, worker: e.target.value }))
                }
                className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-400">
              Issue / Task Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Recalibrate MQ-2 methane sensor"
              value={newTask.issue}
              onChange={(e) =>
                setNewTask((p) => ({ ...p, issue: e.target.value }))
              }
              className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-400">
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask((p) => ({ ...p, priority: e.target.value }))
                }
                className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.08] bg-[#111925] px-3 text-xs text-white outline-none"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-400">
                Technician
              </label>
              <input
                type="text"
                value={newTask.technician}
                onChange={(e) =>
                  setNewTask((p) => ({ ...p, technician: e.target.value }))
                }
                className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-400">
                Due
              </label>
              <input
                type="text"
                value={newTask.due}
                onChange={(e) =>
                  setNewTask((p) => ({ ...p, due: e.target.value }))
                }
                className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs text-slate-300 hover:bg-white/[0.04]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400"
            >
              Add Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Maintenance;