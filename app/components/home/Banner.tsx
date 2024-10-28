import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Coupon } from "@prisma/client";

export function Banner({
  couponsWithBanners,
}: {
  couponsWithBanners: Coupon[];
}) {
  const swiperRef = useRef<any>(null);

  return (
    <div className="relative py-6">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1.3}
        centeredSlides={true}
        loop={true}
        navigation={{
          prevEl: ".swiper-button-prev",
          nextEl: ".swiper-button-next",
        }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        className=""
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {couponsWithBanners.map((coupon) => (
          <SwiperSlide key={coupon.id} className="swiper-slide">
            <img
              src={coupon.bannerImage!}
              alt={coupon.name || "Coupon banner"}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
        <div className="swiper-button-prev absolute !left-20 top-1/2 transform -translate-y-1/2 z-10 bg-white !text-gray-600  bg-opacity-50 rounded-tl-full rounded-bl-full cursor-pointer p-8">
          <ChevronLeft size={20} />
        </div>
        <div className="swiper-button-next absolute !right-20 top-1/2 transform -translate-y-1/2 z-10 bg-white !text-gray-600 bg-opacity-50 rounded-tr-full rounded-br-full cursor-pointer p-8">
          <ChevronRight size={20} />
        </div>
      </Swiper>
    </div>
  );
}
