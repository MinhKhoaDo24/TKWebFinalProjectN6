// Tailwind CDN
const tw = document.createElement("script");
tw.src = "https://cdn.tailwindcss.com";
document.head.appendChild(tw);

// Tailwind config
tw.onload = () => {
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          bgMain: "#121212",
          bgCard: "#1e1e1e",
          bgInput: "#2a2a2a",
          primary: "#8b5cf6",
        },
        backgroundImage: {
          "gradient-brand":
            "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
        },
      },
    },
  };
};

// Font Awesome
const fa = document.createElement("link");
fa.rel = "stylesheet";
fa.href =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
document.head.appendChild(fa);
