import { navigate } from "../navigation/";
import React from "react";
import Note from "../components/note";
import Notebook from "../components/notebook";
import Tag from "../components/tag";
import Topic from "../components/topic";
import TrashItem from "../components/trash-item";
import {
  getItemHeight,
  getNotebookHeight,
  getNoteHeight,
  MAX_HEIGHTS,
} from "./height-calculator";

function createProfile(item, itemHeight, estimatedItemHeight) {
  return { item, itemHeight, estimatedItemHeight };
}

const NotesProfile = createProfile(
  (index, item, context) => (
    <Note index={index} pinnable={!context} item={item} context={context} />
  ),
  getNoteHeight,
  MAX_HEIGHTS.note
);

const NotebooksProfile = createProfile(
  (index, item) => (
    <Notebook
      index={index}
      item={item}
      onClick={() => {
        navigate(`/notebooks/${item.id}`);
      }}
      onTopicClick={(notebook, topic) =>
        navigate(`/notebooks/${notebook.id}/${topic}`)
      }
    />
  ),
  getNotebookHeight,
  MAX_HEIGHTS.notebook
);

const TagsProfile = createProfile(
  (index, item) => <Tag item={item} index={index} />,
  getItemHeight,
  MAX_HEIGHTS.generic
);

const TopicsProfile = createProfile(
  (index, item, context) => (
    <Topic
      index={index}
      item={item}
      onClick={() => navigate(`/notebooks/${context.notebookId}/${item.id}`)}
    />
  ),
  getItemHeight,
  MAX_HEIGHTS.generic
);

const TrashProfile = createProfile(
  (index, item) => <TrashItem index={index} item={item} />,
  (item) => {
    if (item.itemType === "note") return getNoteHeight(item);
    else if (item.itemType === "notebook") return getNotebookHeight(item);
  },
  Math.max(MAX_HEIGHTS.note, MAX_HEIGHTS.notebook)
);

export default {
  home: NotesProfile,
  notebooks: NotebooksProfile,
  notes: NotesProfile,
  tags: TagsProfile,
  topics: TopicsProfile,
  trash: TrashProfile,
};
