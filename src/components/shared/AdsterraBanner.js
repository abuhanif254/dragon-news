"use client";
import React from "react";

export default function AdsterraBanner({ adKey, width, height }) {
  // Using srcDoc isolates the ad in its own browsing context.
  // This prevents 'window.atOptions' from being overwritten by other ads on the same page,
  // prevents document.write() from destroying the React app, and allows reusing the same adKey.
  const adHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            overflow: hidden; 
            background: transparent;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          var atOptions = {
            'key' : '${adKey}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div
      className="flex justify-center items-center w-full my-4 overflow-hidden"
      style={{ minHeight: height }}
    >
      <iframe
        srcDoc={adHtml}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{ border: "none", overflow: "hidden" }}
        title={`Adsterra Ad ${adKey}`}
      />
    </div>
  );
}
