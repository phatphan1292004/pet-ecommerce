const statCards = [
  { label: "Doanh thu hom nay", value: "28.400.000 VND", trend: "+12%" },
  { label: "Don moi", value: "124", trend: "+8%" },
  { label: "Nguoi dung moi", value: "35", trend: "+5%" },
  { label: "Ty le hoan thanh", value: "96%", trend: "+1.5%" },
];

const recentActivities = [
  "Don #10034 da duoc xac nhan",
  "Khach hang Nguyen Van A dang ky tai khoan",
  "San pham Hat cho meo 5kg sap het hang",
  "Don #10030 da giao thanh cong",
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-neutral-4">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-black">{card.value}</p>
            <p className="mt-2 text-sm font-medium text-primary-1">{card.trend}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-neutral-black">Tong quan 7 ngay</h2>
          <div className="mt-4 flex h-64 items-center justify-center rounded-xl bg-linear-to-r from-primary-6 via-white to-secondary-5 text-sm text-neutral-4">
            Bieu do thong ke se hien thi tai day
          </div>
        </article>

        <article className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-black">Hoat dong gan day</h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-3">
            {recentActivities.map((activity) => (
              <li key={activity} className="rounded-lg bg-neutral-10 px-3 py-2">
                {activity}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}