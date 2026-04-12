const orders = [
  {
    id: "#10034",
    customer: "Nguyen Van A",
    total: "1.240.000 VND",
    payment: "Da thanh toan",
    status: "Dang giao",
  },
  {
    id: "#10033",
    customer: "Tran Thi B",
    total: "580.000 VND",
    payment: "COD",
    status: "Cho xac nhan",
  },
  {
    id: "#10032",
    customer: "Le Van C",
    total: "2.060.000 VND",
    payment: "Da thanh toan",
    status: "Hoan thanh",
  },
];

export default function OrderPage() {
  return (
    <section className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-black">Quan ly don hang</h2>
        <button
          type="button"
          className="rounded-lg bg-primary-1 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-2"
        >
          Tao don moi
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-neutral-4">
              <th className="px-3 py-2 font-medium">Ma don</th>
              <th className="px-3 py-2 font-medium">Khach hang</th>
              <th className="px-3 py-2 font-medium">Tong tien</th>
              <th className="px-3 py-2 font-medium">Thanh toan</th>
              <th className="px-3 py-2 font-medium">Trang thai</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="rounded-lg bg-neutral-10 text-neutral-2">
                <td className="rounded-l-lg px-3 py-3 font-semibold text-neutral-black">{order.id}</td>
                <td className="px-3 py-3">{order.customer}</td>
                <td className="px-3 py-3">{order.total}</td>
                <td className="px-3 py-3">{order.payment}</td>
                <td className="rounded-r-lg px-3 py-3">
                  <span className="rounded-full bg-secondary-5 px-3 py-1 text-xs font-semibold text-neutral-2">
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}