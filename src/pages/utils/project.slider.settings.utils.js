export function projectSliderSettings(totalSliderItems) {
  return {
    dots: true,
    infinite: totalSliderItems.length > 5,
    speed: 250,
    slidesToShow: 4,
    slidesToScroll: 4,
    autoplay: true,
    autoplaySpeed: 3000,
    vertical: true,
    verticalSwiping: true,
    adaptiveHeight: false,
  };
}

export function reportsSliderSettings() {
  return {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
  };
}