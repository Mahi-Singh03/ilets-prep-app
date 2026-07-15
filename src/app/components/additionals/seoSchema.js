export default function SEOSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://codershipai.com/#organization",
        "name": "Codership AI",
        "description": "A collaborative code editor built for students to learn and practice coding together in real-time.",
        "url": "https://codershipai.com",
        "logo": [
          {
            "@type": "ImageObject",
            "url": "https://res.cloudinary.com/dyigmfiar/image/upload/v1778833118/light_cxol3v.ico",
            "width": 32,
            "height": 32,
            "name": "Codership AI Light Logo",
          },
          {
            "@type": "ImageObject",
            "url": "https://res.cloudinary.com/dyigmfiar/image/upload/v1778833117/dark_c4x0ww.ico",
            "width": 32,
            "height": 32,
            "name": "Codership AI Dark Logo",
          },
        ],
        "sameAs": [
          "https://github.com/Mahi-Singh03/codershipai",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://codershipai.com/#website",
        "url": "https://codershipai.com",
        "name": "Codership AI",
        "description": "Collaborative Code Editor for Students",
        "publisher": {
          "@id": "https://codershipai.com/#organization",
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://codershipai.com/#webpage",
        "url": "https://codershipai.com",
        "name": "Codership AI - Collaborative Code Editor for Students",
        "description": "A collaborative code editor built for students to learn and practice coding together in real-time.",
        "isPartOf": {
          "@id": "https://codershipai.com/#website",
        },
        "publisher": {
          "@id": "https://codershipai.com/#organization",
        },
        "image": {
          "@type": "ImageObject",
          "url": "https://res.cloudinary.com/dyigmfiar/image/upload/v1778833118/light_cxol3v.ico",
          "width": 32,
          "height": 32,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
