import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { photo } from "./collection";

function Banner() {
  return (
    <div className="">
      <Carousel
        autoPlay={true}
        infiniteLoop={true}
        interval={3000} // 1 second (very fast!)
        showThumbs={false}
        showIndicators={false}
        transitionTime={800} // Very fast transition
        showStatus={false}
        className="h-full" // Make carousel fill container
        stopOnHover={false}
      >
        {photo.map((imgitem, index) => (
          // WRAP EACH IMAGE IN A DIV
          <div key={index}>
            <img
              src={imgitem}
              alt={`Restaurant ${index + 1}`}
              className="size-min-100 object-cover rounded-4xl"
            />
          </div>
        ))}
      </Carousel>
      
    </div>
  );
}

export default Banner;
