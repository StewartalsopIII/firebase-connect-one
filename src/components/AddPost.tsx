import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

const AddPost: React.FC = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      let imageUrl = "";
      if (image) {
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        text,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      setText("");
      setImage(null);
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-black"
      style={{
        backgroundImage: "url('/dragon-background.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="add-post p-4 mx-auto max-w-2xl bg-black bg-opacity-80 text-green-400 font-mono"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400 uppercase">
          Create a New Post
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 mb-4 border-2 border-green-400 bg-black text-green-400 font-mono"
        />
        <div
          className={`border-2 border-dashed p-4 text-center mb-4 ${
            dragActive ? "border-yellow-400 bg-green-900" : "border-green-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer text-yellow-400 hover:text-yellow-200 uppercase"
          >
            [Click to upload]
          </label>{" "}
          or drag and drop your image here
          {image && <p className="mt-2 text-sm text-green-400">{image.name}</p>}
        </div>
        <button
          type="submit"
          className="bg-green-400 text-black px-4 py-2 w-full uppercase font-bold hover:bg-yellow-400"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default AddPost;
