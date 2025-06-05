import React, { useState } from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import httpClient from "@/app/httpClient";



const PostInfo = ({ postId, index, currentIndex } : {postId : any, index : any, currentIndex : any}) => {
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [price, setPrice] = useState(0);
    const [total, setTotal] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [photo, setPhoto] = useState("");
    const [userId, setUserId] = useState(-1);

    const getData = async (id: number) => {
        try {
        const resp = await httpClient.get("http://127.0.0.1:5000/getData", {
            params: { id: id },
        });

        setTitle(resp.data.title);
        setUrl(resp.data.url)
        setPrice(resp.data.price);
        setShipping(resp.data.shipping);
        setTotal(resp.data.total);
        setPhoto(resp.data.photo);  
        } catch (error) {
        console.error("Error getting data: ", error);
        }
    };

    getData(postId);
    return (
    <>
      <View style={styles.container}>
        <View>
         <View>
          
          </View>
          <Text style={styles.title}>{title}</Text>

        </View>
      </View>

      <ActivityIcons postId = {postId} index={index} currentIndex={currentIndex} />
    </>
  );
};

const ActivityIcons = ({ postId, index, currentIndex } : {postId : any, index : any, currentIndex : any}) => {
  // <AntDesign name="heart" siize={24} color="black" />

  const [isSaved, setIsSaved] = useState(false);
  //useState(item.isLike);

  const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [price, setPrice] = useState(0);
    const [total, setTotal] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [photo, setPhoto] = useState("");
    const [userId, setUserId] = useState(-1);

    const getData = async (id: number) => {
        try {
        const resp = await httpClient.get("http://127.0.0.1:5000/getData", {
            params: { id: id },
        });

        setTitle(resp.data.title);
        setUrl(resp.data.url)
        setPrice(resp.data.price);
        setShipping(resp.data.shipping);
        setTotal(resp.data.total);
        setPhoto(resp.data.photo);  
        } catch (error) {
        console.error("Error getting data: ", error);
        }
    };

    getData(postId);


  return (
    <View
      style={{
        position: "absolute",
        bottom: 200,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <TouchableOpacity
        onPress={() => setIsSaved(!isSaved)}
        style={{ padding: 10 }}
      >
        <Ionicons name = {isSaved ? "bookmark" : "bookmark-outline"} size = {30} color = "white"></Ionicons>
        
      </TouchableOpacity>

    </View>
  );
};

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: width,
    zIndex: 1,
    bottom: 80,
    padding: 10,
  },
  userInfoContainer: {
    width: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  imgView: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: "#fff",
    margin: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 100,
  },
  userName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    color: "#fff",
    fontSize: 14,
    marginHorizontal: 10,
  },
  audioContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "rgba(52,52,52,0.6)",
    borderRadius: 50,
    width: width / 1.23,
  },
  audioText: {
    color: "#fff",
  },
});

export default PostInfo;