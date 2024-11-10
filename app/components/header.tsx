import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { UserIcon } from "lucide-react";
import { useOptionalCustomer } from "~/hooks/use-optional-customer";
import { CartSheet } from "./client/cart-sheet";

export function Header() {
  const customer = useOptionalCustomer();

  return (
    <>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 flex justify-center items-center font-bold bg-white text-sm p-2"
      >
        <Link className="text-blue-600 " to="/admin">
          Đến trang admin
        </Link>
      </motion.div>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-blue-900 text-white p-4 fixed top-8 w-full z-50"
      >
        <div className="container mx-auto flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link to="/" className="text-2xl font-bold">
              Domino's Pizza
            </Link>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ul className="flex space-x-4">
              {["KHUYẾN MÃI", "THỰC ĐƠN"].map((item, index) => (
                <motion.li
                  key={item}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    to={`/${item === "KHUYẾN MÃI" ? "promotions" : "menu"}`}
                    className="hover:text-red-300 transition-colors"
                  >
                    {item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-4"
          >
            <Link to="/account" className="text-xl flex items-center gap-2">
              <UserIcon className="w-6 h-6" />
              <span>{customer?.phoneNumbers}</span>
            </Link>
            <CartSheet />
          </motion.div>
        </div>
      </motion.header>
    </>
  );
}
