import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <ScrollViewStyleReset />
        <link
          rel="preload"
          href="/assets/node_modules/%40expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/assets/node_modules/%40expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.6e435534bd35da5fef04168860a9b8fa.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: "MaterialCommunityIcons";
              src: url("/assets/node_modules/%40expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.6e435534bd35da5fef04168860a9b8fa.ttf") format("truetype");
              font-display: block;
            }
            @font-face {
              font-family: "Ionicons";
              src: url("/assets/node_modules/%40expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf") format("truetype");
              font-display: block;
            }
            @font-face {
              font-family: "AntDesign";
              src: url("/assets/node_modules/%40expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/AntDesign.3f78af31cca60105799838a1a7a59fbd.ttf") format("truetype");
              font-display: block;
            }
            @font-face {
              font-family: "Feather";
              src: url("/assets/node_modules/%40expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ca4b48e04dc1ce10bfbddb262c8b835f.ttf") format("truetype");
              font-display: block;
            }
            @font-face {
              font-family: "FontAwesome";
              src: url("/assets/node_modules/%40expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.b06871f281fee6b241d60582ae9369b9.ttf") format("truetype");
              font-display: block;
            }
            @font-face {
              font-family: "MaterialIcons";
              src: url("/assets/node_modules/%40expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.4e85bc9ebe07e0340c9c4fc2f6c38908.ttf") format("truetype");
              font-display: block;
            }
            html { background: #1a1a1a; }
            body {
              max-width: 390px !important;
              margin: 0 auto !important;
              overflow-x: hidden;
              box-shadow: -1px 0 0 #333, 1px 0 0 #333;
            }
            #root {
              max-width: 390px !important;
              overflow-x: hidden;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
