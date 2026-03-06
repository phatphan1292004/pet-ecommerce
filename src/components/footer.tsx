import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-secondary-2 py-12 px-4 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <Image 
                src="/logo.png" 
                alt="ODeli Logo" 
                width={120} 
                height={80}
                className="object-contain"
              />
            </div>
            <div className="text-neutral-black space-y-2">
              <p className="font-semibold">Công Ty TNHH MTV Pet Spots Việt Nam</p>
              <p className="text-sm">Địa chỉ: 123/23</p>
              <p className="text-sm">Mã số Doanh nghiệp: 123123</p>
            </div>
          </div>

          {/* Điều khoản thương mại */}
          <div>
            <h3 className="font-semibold text-neutral-black mb-4">Điều khoản thương mại</h3>
            <ul className="space-y-2 text-sm text-neutral-1">
              <li>
                <Link href="/purchase-policy" className="hover:text-primary-1 transition-colors">
                  Mua Hàng Thanh Toán
                </Link>
              </li>
              <li>
                <Link href="/delivery-policy" className="hover:text-primary-1 transition-colors">
                  Giao Nhận Hàng
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-primary-1 transition-colors">
                  Đổi Trả Hàng
                </Link>
              </li>
              <li>
                <Link href="/customers" className="hover:text-primary-1 transition-colors">
                  Khách Hàng Khiếu Nại
                </Link>
              </li>
            </ul>
          </div>

          {/* Điều Khoản Sử Dụng */}
          <div>
            <h3 className="font-semibold text-neutral-black mb-4">Điều Khoản Sử Dụng</h3>
            <ul className="space-y-2 text-sm text-neutral-1">
              <li>
                <Link href="/using-website" className="hover:text-primary-1 transition-colors">
                  Sử Dụng Website ODeli
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-primary-1 transition-colors">
                  Chính Sách Bảo Mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Empty Column for spacing - in the image there appears to be another column */}
          <div className="hidden lg:block"></div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-neutral-20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-black">
            © 2025 - Pet Spots Viet Nam
          </p>

          {/* Social Media Icons */}
          <div className="flex items-center gap-4">
            <Link href="#" className="text-neutral-black hover:text-primary-1 transition-colors">
              <FaFacebook size={20} />
            </Link>
            <Link href="#" className="text-neutral-black hover:text-primary-1 transition-colors">
              <FaLinkedin size={20} />
            </Link>
            <Link href="#" className="text-neutral-black hover:text-primary-1 transition-colors">
              <FaYoutube size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
