const CategoryBadge = ({ category }) => {
  return (
    <span
      style={{
        display: "inline-block",
        background: "#c0392b",
        color: "white",
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: 4,
        fontFamily: "'Inter', sans-serif",
        lineHeight: 1.5,
      }}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;
