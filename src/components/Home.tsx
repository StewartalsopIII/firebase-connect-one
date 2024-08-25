import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";

interface Post {
  id: string;
  text: string;
  imageUrl: string;
  userId: string;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(newPosts);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (postId: string) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="home p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Home Feed</h1>
      <div className="max-w-2xl mx-auto">
        {posts.map((post) => (
          <div
            key={post.id}
            className="post bg-white shadow-md rounded-lg p-4 mb-4 cursor-pointer"
            onClick={() => handlePostClick(post)}
          >
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full h-64 object-cover rounded-lg mb-2"
              />
            )}
            <p className="text-gray-800">{post.text}</p>
            {auth.currentUser && auth.currentUser.uid === post.userId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(post.id);
                }}
                className="bg-red-500 text-white px-2 py-1 rounded mt-2"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            {selectedPost.imageUrl && (
              <img
                src={selectedPost.imageUrl}
                alt="Post"
                className="w-full max-h-[70vh] object-contain rounded-lg mb-4"
              />
            )}
            <p className="text-gray-800 text-lg">{selectedPost.text}</p>
            <button
              onClick={closeModal}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;