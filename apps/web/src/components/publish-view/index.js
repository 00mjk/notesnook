import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Flex, Text, Button } from "rebass";
import * as Icon from "../icons";
import Toggle from "../toggle";
import Field from "../field";
import { db } from "../../common/db";
import ClipboardJS from "clipboard";
import ThemeProvider from "../theme-provider";
import { showToast } from "../../utils/toast";

function PublishView(props) {
  const { noteId, position, onClose } = props;
  const [publishId, setPublishId] = useState();
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [selfDestruct, setSelfDestruct] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    setPublishId(db.monographs.monograph(noteId));
  }, [noteId]);

  useEffect(() => {
    var clipboard = new ClipboardJS(".copyPublishLink");
    clipboard.on("success", function (e) {
      e.clearSelection();
    });
    clipboard.on("error", function () {
      console.error("Error while copying text.");
    });

    return () => {
      clipboard?.destroy();
    };
  }, []);

  return (
    <Flex
      sx={{
        position: "absolute",
        zIndex: 999,
        width: ["100%", 350, 350],
        border: "1px solid",
        borderColor: "border",
        borderRadius: "default",
        ...position,
      }}
      bg="background"
      p={2}
      flexDirection="column"
    >
      <Text variant="title">Publish note</Text>
      <Text variant="body" color="fontTertiary">
        This note will be published to a public URL.
      </Text>
      {publishId && (
        <Flex
          mt={1}
          bg="shade"
          p={1}
          sx={{
            border: "1px solid",
            borderColor: "primary",
            borderRadius: "default",
          }}
          justifyContent="space-between"
        >
          <Flex flexDirection="column" mr={2} overflow="hidden">
            <Text variant="body" fontWeight="bold">
              This note is published.
            </Text>
            <Text
              variant="subBody"
              as="a"
              target="_blank"
              href={`https://monographs.notesnook.com/${publishId}`}
              sx={{
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {`https://monographs.notesnook.com/${publishId}`}
            </Text>
          </Flex>
          <Button
            variant="anchor"
            className="copyPublishLink"
            data-clipboard-text={`https://monographs.notesnook.com/${publishId}`}
          >
            <Icon.Copy size={20} color="primary" onClick={() => {}} />
          </Button>
        </Flex>
      )}
      <Toggle
        title="Self destruct?"
        onTip="Note will be automatically unpublished after first view."
        offTip="Note will stay published until manually unpublished."
        isToggled={selfDestruct}
        onToggled={() => setSelfDestruct((s) => !s)}
      />
      <Toggle
        title="Password protect?"
        onTip="Protect published note with a password."
        offTip="Do not protect published note with a password."
        isToggled={isPasswordProtected}
        onToggled={() => setIsPasswordProtected((s) => !s)}
      />
      {isPasswordProtected && (
        <Field
          id="publishPassword"
          label="Password"
          helpText="Enter password to encrypt this note"
          required
          sx={{ my: 1 }}
        />
      )}
      <Flex alignItems="center" justifyContent="space-evenly" mt={2}>
        <Button
          flex={1}
          mr={2}
          disabled={isPublishing}
          onClick={async () => {
            try {
              setIsPublishing(true);
              const password =
                document.getElementById("publishPassword")?.value;

              const publishId = await db.monographs.publish(noteId, {
                selfDestruct,
                password,
              });
              setPublishId(publishId);
              showToast("success", "Note published.");
            } catch (e) {
              console.error(e);
              showToast("error", "Note could not be published: " + e.message);
            } finally {
              setIsPublishing(false);
            }
          }}
        >
          {isPublishing ? (
            <>
              <Icon.Loading color="static" />
            </>
          ) : publishId ? (
            "Update"
          ) : (
            "Publish"
          )}
        </Button>
        {publishId && (
          <Button
            flex={1}
            bg="errorBg"
            mr={2}
            color="error"
            disabled={isPublishing}
            onClick={async () => {
              try {
                setIsPublishing(true);
                await db.monographs.unpublish(noteId);
                setPublishId();
                onClose(true);
                showToast("success", "Note unpublished.");
              } catch (e) {
                console.error(e);
                showToast(
                  "error",
                  "Note could not be unpublished: " + e.message
                );
              } finally {
                setIsPublishing(false);
              }
            }}
          >
            Unpublish
          </Button>
        )}
        <Button
          flex={1}
          disabled={isPublishing}
          variant="secondary"
          onClick={() => {
            onClose(false);
          }}
        >
          Cancel
        </Button>
      </Flex>
    </Flex>
  );
}

export default PublishView;

export function showPublishView(noteId, location = "top") {
  const root = document.getElementById("dialogContainer");

  if (root) {
    return new Promise((resolve) => {
      const perform = (result) => {
        ReactDOM.unmountComponentAtNode(root);
        resolve(result);
      };
      ReactDOM.render(
        <ThemeProvider>
          <PublishView
            noteId={noteId}
            position={{
              top: location === "top" ? [0, 50, 50] : undefined,
              right: location === "top" ? [0, 20, 20] : undefined,
              bottom: location === "bottom" ? 0 : undefined,
              left: location === "bottom" ? 0 : undefined,
            }}
            onClose={perform}
          />
        </ThemeProvider>,
        root
      );
    });
  }
  return Promise.reject("No element with id 'dialogContainer'");
}
