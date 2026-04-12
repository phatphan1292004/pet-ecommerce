const users = [
  {
    name: "Nguyen Van A",
    email: "nguyenvana@gmail.com",
    role: "Khach hang",
    status: "Hoat dong",
  },
  {
    name: "Tran Thi B",
    email: "tranthib@gmail.com",
    role: "Nhan vien",
    status: "Hoat dong",
  },
  {
    name: "Le Van C",
    email: "levanc@gmail.com",
    role: "Admin",
    status: "Tam khoa",
  },
];

export default function UserPage() {
  return (
    <section className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-black">Quan ly nguoi dung</h2>
        <button
          type="button"
          className="rounded-lg bg-neutral-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Them nguoi dung
        </button>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <article
            key={user.email}
            className="flex flex-col gap-3 rounded-xl border border-neutral-20 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-neutral-black">{user.name}</p>
              <p className="text-sm text-neutral-4">{user.email}</p>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="rounded-full bg-secondary-5 px-3 py-1 font-medium text-neutral-2">
                {user.role}
              </span>
              <span
                className={`rounded-full px-3 py-1 font-medium ${
                  user.status === "Hoat dong"
                    ? "bg-primary-6 text-primary-1"
                    : "bg-neutral-20 text-neutral-2"
                }`}
              >
                {user.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}