export const fadeIn = (direction: "up" | "down") => {
  return {
    hidden: {
      opacity: 0,
      y: direction === "down" ? -32 : 32,
    },
    visible: { opacity: 1, y: 0 },
  };
};

export const scale = () => {
  return {
    hidden: {
      scale: 0.9,
      opacity: 0,
    },
    visible: { scale: 1, opacity: 1 },
  };
};
