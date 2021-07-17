import React, { useEffect, useCallback, useMemo } from "react";
import { Box, Flex, Text } from "rebass";
import * as Icon from "../icons";
import {
  store as selectionStore,
  useStore as useSelectionStore,
} from "../../stores/selection-store";
import { useOpenContextMenu } from "../../utils/useContextMenu";
import { SELECTION_OPTIONS_MAP } from "../../common";

function selectMenuItem(isSelected, toggleSelection) {
  return {
    key: "select",
    title: () => (isSelected ? "Unselect" : "Select"),
    icon: Icon.Select,
    onClick: () => {
      const selectionState = selectionStore.get();
      if (!selectionState.isSelectionMode) {
        selectionState.toggleSelectionMode();
        toggleSelection();
      } else {
        toggleSelection();
      }
    },
  };
}

const ItemSelector = ({ isSelected, toggleSelection }) => {
  return isSelected ? (
    <Icon.CheckCircle
      color="primary"
      size={16}
      sx={{
        flexShrink: 0,
        marginLeft: 0,
        marginRight: 1,
        color: "primary",
        cursor: "pointer",
      }}
      onClick={(e) => {
        e.stopPropagation();
        toggleSelection();
      }}
    />
  ) : (
    <Icon.CircleEmpty
      size={16}
      sx={{
        flexShrink: 0,
        marginLeft: 0,
        marginRight: 1,
        bg: "transparent",
        cursor: "pointer",
      }}
      onClick={(e) => {
        e.stopPropagation();
        toggleSelection();
      }}
    />
  );
};

function ListItem(props) {
  const {
    colors: { shade, text, primary, background } = {
      shade: "shade",
      primary: "primary",
      text: "text",
      background: "background",
    },
    isFocused,
    isCompact,
  } = props;

  const isSelectionMode = useSelectionStore((store) => store.isSelectionMode);
  const selectedItems = useSelectionStore((store) => store.selectedItems);
  const isSelected =
    selectedItems.findIndex((item) => props.item.id === item.id) > -1;
  const selectItem = useSelectionStore((store) => store.selectItem);

  const openContextMenu = useOpenContextMenu();

  const toggleSelection = useCallback(
    function toggleSelection() {
      selectItem(props.item);
    },
    [selectItem, props.item]
  );

  const menuItems = useMemo(() => {
    let items = props.menu?.items;
    if (!items) return [];

    if (isSelectionMode) {
      const options = SELECTION_OPTIONS_MAP[window.currentViewType];
      items = options.map((option) => {
        return {
          key: option.key,
          title: () => option.title,
          icon: option.icon,
          onClick: option.onClick,
        };
      });
    }
    if (props.selectable)
      items = [selectMenuItem(isSelected, toggleSelection), ...items];
    return items;
  }, [
    props.menu?.items,
    isSelected,
    isSelectionMode,
    toggleSelection,
    props.selectable,
  ]);

  useEffect(() => {
    if (!isSelectionMode && isSelected) toggleSelection();
  }, [isSelectionMode, toggleSelection, isSelected]);

  return (
    <Flex
      bg={isSelected ? shade : background}
      onContextMenu={(e) =>
        openContextMenu(e, menuItems, props.menu?.extraData, false)
      }
      p={2}
      py={isCompact ? 2 : 3}
      tabIndex={props.index}
      justifyContent="center"
      sx={{
        height: "inherit",
        cursor: "pointer",
        position: "relative",
        borderLeft: isFocused ? "3px solid" : "none",
        borderLeftColor: primary,
        ":hover": {
          backgroundColor: "hover",
        },
        ":focus": {
          outline: "none",
        },
        ":focus-visible": {
          border: "1px solid",
          borderColor: "primary",
        },
      }}
      onKeyPress={(e) => {
        if (e.key === "Enter") e.target.click();
      }}
      flexDirection="column"
      onClick={() => {
        //e.stopPropagation();
        if (isSelectionMode) {
          toggleSelection();
        } else if (props.onClick) {
          props.onClick();
        }
      }}
      data-test-id={`${props.item.type}-${props.index}`}
    >
      {props.header}

      <Text
        data-test-id={`${props.item.type}-${props.index}-title`}
        variant={isCompact ? "subtitle" : "title"}
        fontWeight={"bold"}
        color={text}
        display={isSelectionMode ? "flex" : "block"}
        sx={{
          lineHeight: "1.4rem",
          maxHeight: "1.4rem", // 1 lines, i hope
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {isSelectionMode && (
          <ItemSelector
            isSelected={isSelected}
            toggleSelection={toggleSelection}
          />
        )}
        {props.title}
      </Text>

      {!isCompact && props.body && (
        <Text
          as="p"
          variant="body"
          data-test-id={`${props.item.type}-${props.index}-body`}
          sx={{
            lineHeight: `1.2rem`,
            overflow: "hidden",
            textOverflow: "ellipsis",
            position: "relative",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
          }}
        >
          {props.body}
        </Text>
      )}
      {props.footer && <Box mt={isCompact ? 0 : 1}>{props.footer}</Box>}
    </Flex>
  );
}
export default ListItem;
