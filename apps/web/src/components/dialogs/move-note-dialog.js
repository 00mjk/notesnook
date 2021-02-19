import React from "react";
import { Flex, Box, Text } from "rebass";
import * as Icon from "../icons";
import { db } from "../../common/db";
import Dialog from "./dialog";
import { showNotesMovedToast } from "../../common/toasts";
import { showToast } from "../../utils/toast";
import Field from "../field";
import { store as notestore } from "../../stores/note-store";

class MoveDialog extends React.Component {
  _inputRef;
  selectedNotebook;
  selectedTopic;
  state = {
    currentOpenedIndex: -1,
    notebooks: db.notebooks.all,
  };

  refresh() {
    this.setState({ notebooks: db.notebooks.all });
    notestore.refresh();
  }

  async addNotebook(input) {
    if (input.value.length > 0) {
      await db.notebooks.add({
        title: input.value,
      });
      this.setState({ notebooks: db.notebooks.all });
      input.value = "";
    }
  }

  async addTopic(notebook, input) {
    if (input.value.length > 0) {
      await db.notebooks.notebook(notebook).topics.add(input.value);
      this.setState({ notebooks: db.notebooks.all });
      input.value = "";
    }
  }

  _topicHasNotes(topic, noteIds) {
    return noteIds.some((id) => topic.notes.indexOf(id) > -1);
  }

  async _addNoteToTopic(notebook, topic) {
    const { noteIds } = this.props;
    if (this._topicHasNotes(topic, noteIds)) {
      await db.notebooks
        .notebook(topic.notebookId)
        .topics.topic(topic.id)
        .delete(...noteIds);
      this.refresh();
      return;
    }
    try {
      const nb = {
        id: notebook.id,
        topic: topic.id,
      };
      const note = db.notes.note(noteIds[0]).data;
      await db.notes.move(nb, ...noteIds);
      showNotesMovedToast(note, noteIds, nb);
      this.refresh();
    } catch (e) {
      showToast("error", e.message);
      console.error(e);
    }
  }

  render() {
    const { notebooks, currentOpenedIndex } = this.state;
    const props = this.props;
    return (
      <Dialog
        isOpen={true}
        title={"Add to Notebook"}
        description={"Organize your notes by adding them to notebooks."}
        icon={Icon.Move}
        onClose={props.onClose}
        negativeButton={{
          text: "Done",
          onClick: props.onClose,
        }}
      >
        <Flex flexDirection="column" sx={{ overflowY: "hidden" }}>
          <Field
            inputRef={(ref) => (this.inputRef = ref)}
            data-test-id="mnd-new-notebook-title"
            label="Notebooks"
            id="notebook-title"
            name="notebook-title"
            helpText="Add a new notebook"
            placeholder="Press enter to add a new notebook"
            action={{
              onClick: async () => {
                await this.addNotebook(this.inputRef);
              },
              icon: Icon.Plus,
            }}
            onKeyUp={async (e) => {
              if (e.key === "Enter") await this.addNotebook(e.target);
            }}
          />
          <Box
            mt={1}
            sx={{
              borderRadius: "default",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "border",
              overflowY: "auto",
            }}
          >
            {notebooks.map((notebook, index) => (
              <Flex variant="columnFill" key={notebook.id}>
                <Item
                  data-test-id={`notebook-${index}`}
                  icon={Icon.Notebook}
                  title={notebook.title}
                  totalNotes={notebook.totalNotes}
                  onClick={(e) => {
                    this.setState({
                      currentOpenedIndex:
                        this.state.currentOpenedIndex === index ? -1 : index,
                    });
                  }}
                  action={
                    currentOpenedIndex === index && (
                      <Icon.Plus
                        size={20}
                        onClick={(e) => {
                          e.stopPropagation();
                          this.setState({
                            isAddingTopic: true,
                          });
                        }}
                      />
                    )
                  }
                />
                <Flex
                  variant="columnFill"
                  style={{
                    display: currentOpenedIndex === index ? "flex" : "none",
                  }}
                >
                  {this.state.isAddingTopic && (
                    <Field
                      autoFocus
                      inputRef={(ref) => (this.inputRef = ref)}
                      data-test-id="mnd-new-topic-title"
                      id="topic-title"
                      name="topic-title"
                      placeholder="Press enter to add a topic"
                      action={{
                        onClick: () => {
                          this.setState({
                            isAddingTopic: false,
                          });
                        },
                        icon: Icon.Close,
                      }}
                      onKeyUp={async (e) => {
                        if (e.key === "Enter")
                          await this.addTopic(notebook, e.target);
                      }}
                    />
                  )}
                  {notebook.topics.map((topic, topicIndex) => (
                    <Item
                      data-test-id={`notebook-${index}-topic-${topicIndex}`}
                      key={topic.id}
                      onClick={() => this._addNoteToTopic(notebook, topic)}
                      indent={1}
                      icon={Icon.Topic}
                      title={topic.title}
                      totalNotes={topic.totalNotes}
                      action={
                        this._topicHasNotes(topic, props.noteIds) ? (
                          <Text color="error" fontSize="body">
                            Remove from
                          </Text>
                        ) : (
                          <Text color="primary" fontSize="body">
                            Add to
                          </Text>
                        )
                      }
                    />
                  ))}
                </Flex>
              </Flex>
            ))}
          </Box>
        </Flex>
      </Dialog>
    );
  }
}
export default MoveDialog;

function Item(props) {
  const { icon: Icon, indent = 0, title, totalNotes, onClick, action } = props;
  return (
    <Flex
      data-test-id={props["data-test-id"]}
      p={1}
      justifyContent="space-between"
      alignItems="center"
      pr={2}
      pl={!indent ? 2 : indent * 30}
      sx={{
        borderWidth: 1,
        borderBottomColor: "border",
        borderBottomStyle: "solid",
        cursor: "pointer",
        ":hover": { borderBottomColor: "primary" },
      }}
      onClick={onClick}
    >
      <Flex alignItems="center" justifyContent="center">
        <Icon />
        <Flex ml={1} flexDirection="column">
          <Text as="span" color="text" fontSize="body">
            {title}
          </Text>
          <Text variant="subBody">{totalNotes + " Notes"}</Text>
        </Flex>
      </Flex>
      {action}
    </Flex>
  );
}
