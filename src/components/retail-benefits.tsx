export default function RetailBenefits() {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-gray-50 my-20">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg font-bold uppercase tracking-[0.35em] text-primary-1/80">
            Tin cậy & tiện lợi
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Giải pháp mua sắm thú cưng cho mọi gia đình
          </h2>
          <p className="mt-4 text-sm text-slate-600 sm:text-base">
            Tập trung vào trải nghiệm bán lẻ: sản phẩm chính hãng, giao nhanh,
            và hỗ trợ tận tâm cho thú cưng của bạn.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-6 text-primary-1">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 13.5V6a1 1 0 0 1 1-1h9" />
                <path d="M16 6h2.5l2.5 3.5V13" />
                <circle cx="7" cy="16" r="2" />
                <circle cx="18" cy="16" r="2" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">Giao nhanh trong ngày</h3>
            <p className="mt-2 text-sm text-slate-600">
              Đặt hàng dễ dàng, giao hàng linh hoạt cho nhu cầu hằng ngày.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-6 text-primary-1">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">Chính hãng rõ nguồn gốc</h3>
            <p className="mt-2 text-sm text-slate-600">
              Chọn lọc thương hiệu uy tín, an tâm cho sức khỏe thú cưng.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-6 text-primary-1">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7a4 4 0 0 1-4 4H8a4 4 0 1 1 0-8h8a4 4 0 0 1 4 4z" />
                <path d="M4 17a4 4 0 0 0 4 4h8a4 4 0 0 0 0-8H8a4 4 0 0 0-4 4z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">Tư vấn cá nhân hóa</h3>
            <p className="mt-2 text-sm text-slate-600">
              Hỗ trợ chọn sản phẩm phù hợp theo giống, tuổi, cân nặng.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-6 text-primary-1">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">Hỗ trợ 24/7</h3>
            <p className="mt-2 text-sm text-slate-600">
              Giải đáp nhanh chóng, đổi trả dễ dàng khi cần thiết.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
