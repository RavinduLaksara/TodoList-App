import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBorder} />
      <View style={styles.centerContent}>
        <Text style={styles.title}>To-Do List</Text>
        <Text style={styles.subtitle}>Organize your tasks easily</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => navigation.navigate("Tasks")}
            activeOpacity={0.7}
          >
            <Icon name="list" size={22} color="#ff9900" />
            <Text style={styles.buttonText}>Tasks</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181813",
    paddingTop: 0,
  },
  topBorder: {
    height: 6,
    width: width,
    backgroundColor: "#ff9900",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#ff9900",
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  squareButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#23231c",
    borderWidth: 2,
    borderColor: "#ff9900",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },
  buttonText: {
    color: "#ff9900",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "bold",
  },
});
