import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ title, description, keywords, url, image }) => {
  const siteTitle = 'TaskBridge - Smart Workforce Management';
  const siteDescription = 'TaskBridge helps schools, hospitals, and organizations manage shifts, track attendance, and streamline communication with ease.';
  const siteUrl = 'https://www.taskbridge.se';
  const siteImage = 'https://www.taskbridge.se/logo512.png';

  return (
    <Helmet>
      <title>{title ? `${title} | TaskBridge` : siteTitle}</title>
      <meta name="description" content={description || siteDescription} />
      <meta name="keywords" content={keywords || 'workforce management, shift planning, employee scheduling, task management'} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={description || siteDescription} />
      <meta property="og:image" content={image || siteImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || siteUrl} />
      <meta property="twitter:title" content={title || siteTitle} />
      <meta property="twitter:description" content={description || siteDescription} />
      <meta property="twitter:image" content={image || siteImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url || siteUrl} />
    </Helmet>
  );
};

export default SEO;