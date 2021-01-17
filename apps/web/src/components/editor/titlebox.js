import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text, Flex } from "rebass";
import { Input } from "@rebass/forms";

var changeTimeout;
function TitleBox(props) {
  const { title, setTitle, changeInterval, shouldFocus } = props;

  const [height, setHeight] = useState(0);
  const inputRef = useRef();

  const resize = useCallback(() => {
    const textarea = document.querySelector(".editorTitle");
    const dummy = document.querySelector(".dummyEditorTitle");
    dummy.innerHTML = textarea.value;
    setHeight(dummy.scrollHeight);
  }, []);

  useEffect(() => {
    if (!window.ResizeObserver) return;
    const myObserver = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        const newHeight = entries[0].contentRect.height;
        setHeight(newHeight);
      });
    });
    myObserver.observe(document.querySelector(".dummyEditorTitle"));
    return () => {
      myObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!inputRef.current) return;
    clearTimeout(changeTimeout);
    inputRef.current.value = title;
    resize();
  }, [title, resize]);

  useEffect(() => {
    if (shouldFocus) inputRef.current.focus();
  }, [shouldFocus]);

  return (
    <Flex width="100%" sx={{ position: "relative" }} py={2}>
      <Text
        as="pre"
        className="dummyEditorTitle"
        variant="heading"
        minHeight={[30, 30, 60]}
        fontSize={["1.625em", "1.625em", "2.625em"]}
        sx={{ whiteSpace: "pre-wrap", position: "absolute", zIndex: -1 }}
      ></Text>
      <Input
        ref={inputRef}
        data-test-id="editor-title"
        className="editorTitle"
        autoFocus={shouldFocus}
        placeholder="Note title"
        as="textarea"
        width="100%"
        minHeight={[30, 30, 60]}
        p={0}
        sx={{
          height,
          overflowY: "hidden",
          fontFamily: "heading",
          fontSize: ["1.625em", "1.625em", "2.625em"],
          fontWeight: "heading",
          border: "none",
          resize: "none",
          ":focus": { outline: "none" },
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        onChange={(e) => {
          resize();
          clearTimeout(changeTimeout);
          changeTimeout = setTimeout(
            setTitle.bind(this, e.target.value),
            changeInterval
          );
        }}
      />
    </Flex>
  );
}

export default React.memo(TitleBox, (prevProps, nextProps) => {
  return (
    prevProps.shouldFocus === nextProps.shouldFocus &&
    prevProps.title === nextProps.title
  );
});
