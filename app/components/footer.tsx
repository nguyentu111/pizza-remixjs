import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-blue-900 text-white p-8 mt-8"
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold mb-4">Về Domino's</h3>
          <ul className="space-y-2">
            <li>Giới thiệu</li>
            <li>Tuyển dụng</li>
            <li>Khuyến mãi</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold mb-4">Hỗ trợ</h3>
          <ul className="space-y-2">
            <li>FAQ</li>
            <li>Liên hệ</li>
            <li>Chính sách bảo mật</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-bold mb-4">Địa chỉ</h3>
          <p>123 Pizza Street</p>
          <p>Ho Chi Minh City, Vietnam</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-bold mb-4">Kết nối</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-red-300 transition-colors">
              Facebook
            </a>
            <a href="#" className="hover:text-red-300 transition-colors">
              Instagram
            </a>
            <a href="#" className="hover:text-red-300 transition-colors">
              Twitter
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-8 pt-8 border-t border-blue-800"
      >
        © 2024 Domino's Pizza. All rights reserved.
      </motion.div>
    </motion.footer>
  );
};
