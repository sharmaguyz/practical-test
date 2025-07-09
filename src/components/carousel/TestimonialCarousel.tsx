'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/autoplay';

const testimonials = [
  {
    rating: 4.9,
    text: "The AWS-based learning approach made everything click. I highly recommend this to anyone serious about security.",
    author: "Emma R., U Delaware Student",
    img: "/web/images/testimonial-img2.png",
  },
  {
    rating: 4.9,
    text: "Practical Academy helped me land my first cybersecurity job. The hands-on labs were exactly what I needed to feel job-ready!",
    author: "Alex M. Rowan Student",
    img: "/web/images/testimonial-img1.png",
  },
  {
    rating: 4.9,
    text: "Practical Academy helped me land my first cybersecurity job. The hands-on labs were exactly what I needed to feel job-ready!",
    author: "Alex M. Rowant Student",
    img: "/web/images/testimonial-img3.png",
  },
  {
    rating: 4.9,
    text: "The AWS-based learning approach made everything click. I highly recommend this to anyone serious about security.",
    author: "Emma R., U Delaware Student",
    img: "/web/images/testimonial-img2.png",
  },
  {
    rating: 4.9,
    text: "Practical Academy helped me land my first cybersecurity job. The hands-on labs were exactly what I needed to feel job-ready!",
    author: "Alex M. Rowan Student",
    img: "/web/images/testimonial-img1.png",
  },
  {
    rating: 4.9,
    text: "Practical Academy helped me land my first cybersecurity job. The hands-on labs were exactly what I needed to feel job-ready!",
    author: "Alex M. Rowant Student",
    img: "/web/images/testimonial-img3.png",
  },
];

export default function TestimonialCarousel() {
  return (
    <>
        <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={'auto'}
            autoplay={{
            delay: 2000,
            disableOnInteraction: false,
            }}
            loop={true}
            centeredSlides={false}
            navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
            }}
        >
        {testimonials.map((item, index) => (
          <SwiperSlide key={index} style={{ width: '329px' }}>
            <div className="our-student-say">
              <div className="review-stars flex items-center gap-2 mb-4">
                <p className="text-lg font-semibold">{item.rating}</p>
                <ul className="flex">
                  {[...Array(5)].map((_, i) => (
                    <li key={i}>
                      <img
                        src="/web/images/Review-Stars.png"
                        alt="star"
                        className="w-4 h-4"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text mb-4">
                <p className="text-gray-700">{item.text}</p>
              </div>

              <div className="course-box-bottom">
                <div className="author flex items-center gap-3">
                  <div className="author-profile-img">
                    <img
                      src={item.img}
                      alt="author"
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                  <div className="author-name">
                    <h5 className="font-medium">{item.author}</h5>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        {/* <div className="owl-nav"> */}
        
        {/* </div> */}
        
      </Swiper>

      <div className="swiper-nav-button">
      <div className="swiper-button-prev">
        <img src="/web/images/maki_arrow-black.png" alt="prev" />
      </div>
      <div className="swiper-button-next">
        <img src="/web/images/maki_arrow-black.png" alt="next" />
      </div>
      </div>
    </>
  );
}
