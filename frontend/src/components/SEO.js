import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ title, description, keywords, url, image }) => {
  const siteTitle = 'TaskBridge - Smart Workforce & Room Management';
  const siteDescription = 'TaskBridge helps schools, hospitals, factories manage shifts, assign rooms, track attendance. Supports EN, SV, FI, NO, DA, DE.';
  const siteUrl = 'https://www.taskbridge.se';
  const siteImage = 'https://www.taskbridge.se/logo512.png';

  const defaultKeywords = keywords || 
    'taskbridge, taskbridge.se, workforce management, shift planning, room assignment, school staffing, hospital rostering, factory scheduling, personalhantering, skiftplanering, rumsplacering, skola, sjukhus, fabrik';

  return (
    <Helmet>
      <title>{title ? `${title} | TaskBridge` : siteTitle}</title>
      <meta name="description" content={description || siteDescription} />
      <meta name="keywords" content={defaultKeywords} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Multi-language hreflang */}
      <link rel="alternate" hrefLang="en" href={`${siteUrl}/en`} />
      <link rel="alternate" hrefLang="sv" href={`${siteUrl}/sv`} />
      <link rel="alternate" hrefLang="fi" href={`${siteUrl}/fi`} />
      <link rel="alternate" hrefLang="no" href={`${siteUrl}/no`} />
      <link rel="alternate" hrefLang="da" href={`${siteUrl}/da`} />
      <link rel="alternate" hrefLang="de" href={`${siteUrl}/de`} />
      <link rel="alternate" hrefLang="x-default" href={siteUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={description || siteDescription} />
      <meta property="og:image" content={image || siteImage} />
      <meta property="og:locale" content="sv_SE" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="fi_FI" />
      <meta property="og:locale:alternate" content="nb_NO" />
      <meta property="og:locale:alternate" content="da_DK" />
      <meta property="og:locale:alternate" content="de_DE" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || siteUrl} />
      <meta property="twitter:title" content={title || siteTitle} />
      <meta property="twitter:description" content={description || siteDescription} />
      <meta property="twitter:image" content={image || siteImage} />
      
      {/* Canonical */}
      <link rel="canonical" href={url || siteUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "TaskBridge Room Assignment",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": "Smart room and shift assignment for schools, hospitals, factories. Auto-match groups to rooms/workers by skills, capacity, availability.",
          "audience": { "@type": "Audience", "audienceType": "Schools, Hospitals, Factories" },
          "keywords": "room assignment, shift scheduling, school management, hospital staffing, factory planning, personalhantering, skiftplanering, rumsplacering"
        })}
      </script>
    </Helmet>
  );
};

export default SEO;