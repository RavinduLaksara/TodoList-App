import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Share,
  Modal,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";

const { width } = Dimensions.get("window");
const TASKS_KEY = "TASKS_LIST";

export default function TaskScreen() {
  const [inputs, setInputs] = useState({ title: "", about: "" });
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editInputs, setEditInputs] = useState({ title: "", about: "" });
  const [deleteModal, setDeleteModal] = useState({ visible: false, id: null });

  // Load tasks from AsyncStorage on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const saved = await AsyncStorage.getItem(TASKS_KEY);
        if (saved) setTasks(JSON.parse(saved));
      } catch (e) {}
    };
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage when changed
  useEffect(() => {
    AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (inputs.title.trim() && inputs.about.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          title: inputs.title,
          about: inputs.about,
          completed: false, // <-- Add completed property
        },
      ]);
      setInputs({ title: "", about: "" });
    }
  };

  const handleDelete = (id) => {
    setDeleteModal({ visible: true, id });
  };

  const confirmDelete = () => {
    setTasks(tasks.filter((task) => task.id !== deleteModal.id));
    setDeleteModal({ visible: false, id: null });
  };

  const handleEdit = (task) => {
    setEditId(task.id);
    setEditInputs({ title: task.title, about: task.about });
  };

  const handleSaveEdit = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, title: editInputs.title, about: editInputs.about }
          : task
      )
    );
    setEditId(null);
    setEditInputs({ title: "", about: "" });
  };

  const handleShare = async (task) => {
    try {
      await Share.share({
        message: `Task: ${task.title}\nAbout: ${task.about}`,
      });
    } catch (error) {}
  };

  // Toggle completed state
  const toggleCompleted = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.taskItem}>
      {/* Mark/Checkbox */}
      <TouchableOpacity
        style={styles.checkButton}
        onPress={() => toggleCompleted(item.id)}
      >
        {item.completed ? (
          <Icon name="check-square" size={22} color="#ff9900" />
        ) : (
          <Icon name="square" size={22} color="#ff9900" />
        )}
      </TouchableOpacity>
      {editId === item.id ? (
        <View style={{ flex: 1 }}>
          <TextInput
            style={[styles.input, { marginBottom: 6 }]}
            value={editInputs.title}
            placeholder="Title..."
            placeholderTextColor="#ff9900"
            onChangeText={(text) =>
              setEditInputs((prev) => ({ ...prev, title: text }))
            }
          />
          <TextInput
            style={styles.input}
            value={editInputs.about}
            placeholder="About..."
            placeholderTextColor="#ff9900"
            onChangeText={(text) =>
              setEditInputs((prev) => ({ ...prev, about: text }))
            }
          />
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSaveEdit(item.id)}
            >
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditId(null)}
            >
              <Text style={styles.actionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.taskTitle, item.completed && styles.completedText]}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.taskAbout, item.completed && styles.completedText]}
          >
            {item.about}
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => handleDelete(item.id)}
            >
              <Icon name="x" size={18} color="#ff9900" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => handleShare(item)}
            >
              <Icon name="share-2" size={16} color="#ff9900" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => handleEdit(item)}
            >
              <Icon name="edit-2" size={16} color="#ff9900" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            placeholder="Title..."
            placeholderTextColor="#ff9900"
            value={inputs.title}
            onChangeText={(text) =>
              setInputs((prev) => ({ ...prev, title: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="About..."
            placeholderTextColor="#ff9900"
            value={inputs.about}
            onChangeText={(text) =>
              setInputs((prev) => ({ ...prev, about: text }))
            }
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.noTasksContainer}>
          <View style={styles.underline} />
          <Text style={styles.noTasksText}>No tasks</Text>
          <View style={styles.underline} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 32 }}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      <Modal
        visible={deleteModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModal({ visible: false, id: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTopBorder} />
            <Text style={styles.modalText}>Delete this task?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setDeleteModal({ visible: false, id: null })}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181813",
    padding: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ff9900",
    borderRadius: 4,
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ff9900",
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#ff9900",
    fontSize: 28,
    fontWeight: "bold",
  },
  noTasksContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noTasksText: {
    color: "#fff",
    fontSize: 24,
    marginVertical: 4,
    textAlign: "center",
  },
  underline: {
    height: 3,
    width: 60,
    backgroundColor: "#ff9900",
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 2,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#23231c",
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#ff9900",
  },
  checkButton: {
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  taskTitle: {
    color: "#ff9900",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  taskAbout: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  squareButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#23231c",
    borderWidth: 1,
    borderColor: "#ff9900",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: "#ff9900",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: "#23231c",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ff9900",
  },
  actionText: {
    color: "#181813",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: "#23231c",
    borderRadius: 8,
    alignItems: "center",
    paddingBottom: 24,
    overflow: "hidden",
  },
  modalTopBorder: {
    height: 6,
    width: "100%",
    backgroundColor: "#ff9900",
  },
  modalText: {
    color: "#fff",
    fontSize: 22,
    marginVertical: 32,
    textAlign: "center",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  modalButton: {
    borderWidth: 1,
    borderColor: "#ff9900",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 32,
    marginHorizontal: 12,
    backgroundColor: "#23231c",
  },
  modalButtonText: {
    color: "#ff9900",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
