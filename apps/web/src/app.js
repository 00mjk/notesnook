import React, { useState, useEffect } from "react";
import "./app.css";
import { Box, Flex } from "rebass";
import { MotionConfig, AnimationFeature, GesturesFeature } from "framer-motion";
import ThemeProvider from "./components/theme-provider";
import StatusBar from "./components/statusbar";
import Animated from "./components/animated";
import NavigationMenu from "./components/navigationmenu";
import GlobalMenuWrapper from "./components/globalmenuwrapper";
import { getCurrentPath, NavigationEvents } from "./navigation";
import rootroutes from "./navigation/rootroutes";
import { useStore } from "./stores/app-store";
import { Suspense } from "react";
import useMobile from "./utils/use-mobile";
import useTablet from "./utils/use-tablet";
import HashRouter from "./components/hashrouter";
import ThemeTransition from "./components/themeprovider/themetransition";
import useSlider from "./hooks/use-slider";

const AppEffects = React.lazy(() => import("./app-effects"));
const CachedRouter = React.lazy(() => import("./components/cached-router"));

function App() {
  const [show, setShow] = useState(true);
  const isMobile = useMobile();
  const isTablet = useTablet();
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const toggleSideMenu = useStore((store) => store.toggleSideMenu);
  const setIsEditorOpen = useStore((store) => store.setIsEditorOpen);
  const [sliderRef, slideToIndex] = useSlider({
    onSliding: (e, { lastSlide, position, lastPosition }) => {
      if (!isMobile) return;
      const offset = 70;
      const width = 180;

      const percent = offset - (position / width) * offset;
      if (percent >= 0) {
        const overlay = document.getElementById("overlay");
        overlay.style.opacity = `${percent}%`;
        overlay.style.pointerEvents =
          Math.round(percent) === offset ? "all" : "none";
      }
    },
    onChange: (e, { slide, lastSlide }) => {
      if (!lastSlide || !isMobile) return;
      toggleSideMenu(slide?.index === 0 ? true : false);
      setIsEditorOpen(slide?.index === 2 ? true : false);
    },
  });

  useEffect(() => {
    function onNavigate() {
      NavigationEvents.unsubscribe("onNavigate", onNavigate);
      setIsAppLoaded(true);
    }
    NavigationEvents.subscribe("onNavigate", onNavigate);
  }, []);

  return (
    <MotionConfig features={[AnimationFeature, GesturesFeature]}>
      <ThemeProvider>
        {isAppLoaded && (
          <Suspense fallback={<div style={{ display: "none" }} />}>
            <AppEffects
              slideToIndex={slideToIndex}
              setShow={setShow}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </Suspense>
        )}

        <GlobalMenuWrapper />
        <Flex
          flexDirection="column"
          id="app"
          bg="background"
          height="100%"
          sx={{ overflow: "hidden" }}
        >
          <Flex
            ref={sliderRef}
            variant="rowFill"
            overflowX={["auto", "hidden"]}
            sx={{
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Flex
              flexShrink={0}
              sx={{
                scrollSnapAlign: "start",
              }}
              flexDirection="column"
            >
              <NavigationMenu
                toggleNavigationContainer={(state) => {
                  if (!isMobile) setShow(state || !show);
                }}
              />
            </Flex>
            <Animated.Flex
              className="listMenu"
              variant="columnFill"
              initial={{
                width: isMobile ? "100vw" : isTablet ? "40%" : "25%",
                opacity: 1,
                x: 0,
              }}
              animate={{
                width: show
                  ? isMobile
                    ? "100vw"
                    : isTablet
                    ? "40%"
                    : "25%"
                  : "0%",
                x: show ? 0 : isTablet ? "-40%" : "-25%",
                opacity: show ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              sx={{
                borderRight: "1px solid",
                borderColor: "border",
                borderRightWidth: show ? 1 : 0,
                position: "relative",
                scrollSnapAlign: "start",
              }}
              flexShrink={0}
            >
              <Suspense fallback={<div />}>
                <CachedRouter />
              </Suspense>
              {isMobile && (
                <Box
                  id="overlay"
                  sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                    zIndex: 999,
                    opacity: 0,
                    visibility: "visible",
                    pointerEvents: "none",
                  }}
                  bg="black"
                  onClick={() => {
                    toggleSideMenu(false);
                  }}
                />
              )}
            </Animated.Flex>
            <Flex
              width={["100vw", "100%"]}
              flexShrink={[0, 1]}
              sx={{
                scrollSnapAlign: "start",
              }}
              flexDirection="column"
            >
              <HashRouter />
            </Flex>
          </Flex>
          <StatusBar />
          <ThemeTransition />
        </Flex>
      </ThemeProvider>
    </MotionConfig>
  );
}

function Root() {
  const path = getCurrentPath();
  switch (path) {
    case "/account/verified":
      return rootroutes["/account/verified"]();
    case "/account/recovery":
      return rootroutes["/account/recovery"]();
    default:
      return <App />;
  }
}

export default Root;
