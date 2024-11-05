import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import type { Instruction } from "~/types/delivery";
import type { Swiper as SwiperType } from "swiper";
import { useEffect, useRef } from "react";

interface Props {
  instructions?: Instruction[];
  routeIndex: number;
  currentInstructionIndex: number;
  swiperRefs: React.MutableRefObject<{ [key: string]: SwiperType | null }>;
  onInstructionChange: (index: number) => void;
  onMenuClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  formatDistance: (distance: number) => string;
  getDirectionIcon: (sign: number) => string;
}

export function NavigationInstructions({
  instructions,
  routeIndex,
  currentInstructionIndex,
  swiperRefs,
  onInstructionChange,
  onMenuClick,
  formatDistance,
  getDirectionIcon,
}: Props) {
  if (!instructions) return null;

  const prevRouteIndexRef = useRef(routeIndex);

  useEffect(() => {
    // Reset swiper instance when route changes
    if (prevRouteIndexRef.current !== routeIndex) {
      swiperRefs.current[`swiper-${prevRouteIndexRef.current}`] = null;
      prevRouteIndexRef.current = routeIndex;
    }

    const swiper = swiperRefs.current[`swiper-${routeIndex}`];
    if (swiper && swiper.activeIndex !== currentInstructionIndex) {
      swiper.slideTo(currentInstructionIndex, 0);
    }
  }, [currentInstructionIndex, routeIndex, swiperRefs]);

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-between">
      <div className="relative overflow-hidden flex-1">
        <Swiper
          key={routeIndex} // Add key to force re-render when route changes
          direction="horizontal"
          onSwiper={(swiper) => {
            swiperRefs.current[`swiper-${routeIndex}`] = swiper;
            if (currentInstructionIndex > 0) {
              swiper.slideTo(currentInstructionIndex, 0);
            }
          }}
          centeredSlides={true}
          slidesPerView={1}
          modules={[Navigation]}
          initialSlide={currentInstructionIndex}
          onSlideChange={(swiper) => {
            onInstructionChange(swiper.activeIndex);
          }}
          className="px-4 pb-12"
        >
          {instructions.map((instruction, idx) => (
            <SwiperSlide key={idx}>
              <div className="flex gap-2 items-center p-4">
                <div className="text-3xl">
                  {getDirectionIcon(instruction.sign)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{instruction.text}</p>
                  <div className="text-sm text-gray-500">
                    <span>{formatDistance(instruction.distance)}</span>
                    {" · "}
                    <span>{Math.round(instruction.time / 60000)} phút</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="flex gap-2 pr-4 items-center">
        <Button
          variant="secondary"
          className="rounded h-10 w-10"
          onClick={() => {
            const swiper = swiperRefs.current[`swiper-${routeIndex}`];
            if (swiper) {
              swiper.slidePrev();
            }
          }}
        >
          <ChevronLeft className="h-4 w-4 flex-shrink-0" />
        </Button>
        <Button
          variant="secondary"
          className="rounded h-10 w-10"
          onClick={() => {
            const swiper = swiperRefs.current[`swiper-${routeIndex}`];
            if (swiper) {
              swiper.slideNext();
            }
          }}
        >
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="ml-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
