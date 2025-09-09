import Comment from "@/components/Comment";
import CommentCount from "@/components/CommentCount";
import CommentList from "@/components/CommentList";
import LikeCount from "@/components/LikeCount";
import Loading from "@/components/Loading";
import RelatedBlog from "@/components/RelatedBlog";
import { Avatar } from "@/components/ui/avatar";
import { getEvn } from "@/helpers/getEnv";
import { useFetch } from "@/hooks/useFetch";
import { FaRegCalendarAlt } from "react-icons/fa";
import { AvatarImage } from "@radix-ui/react-avatar";
import { decode } from "entities";
import moment from "moment";
import React from "react";
import { useParams } from "react-router-dom";

const SingleBlogDetails = () => {
  const { blog, category } = useParams();

  const { data, loading, error } = useFetch(
    `${getEvn("VITE_API_BASE_URL")}/blog/get-blog/${blog}`,
    {
      method: "get",
      credentials: "include",
    },
    [blog, category]
  );

  if (loading) return <Loading />;
  return (
    <div className="md:flex-nowrap flex-wrap flex justify-between gap-20">
      {data && data.blog && (
        <>
          <div className="border rounded md:w-[70%] w-full p-5">
            <div className="flex justify-between items-center">
              {/* 

                            <div className='flex justify-between items-center gap-5'>
                                <Avatar>
                                    <AvatarImage src={data.blog.author.avatar} />
                                </Avatar>
                                <div>
                                    <p className='font-bold'>{data.blog.author.name}</p>
                                    <p>Date: {moment(data.blog.createdAt).format('DD-MM-YYYY')}</p>
                                </div>
                            </div>

                            */}

              <div className="flex flex-wrap justify-between items-center gap-5">
                <div>
                  <p className="text-sm sm:text-base">
                    Commémoré(e) le <br />{" "}
                    {moment(data.blog.createdAt).format("DD-MM-YYYY")}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center gap-5">
                <LikeCount props={{ blogid: data.blog._id }} />
                <CommentCount props={{ blogid: data.blog._id }} />
              </div>
            </div>
            <div className="my-5">
              <FirebaseImageDisplay
                src={data.blog.featuredImage}
                className="rounded"
              />
            </div>

            <div className="max-w-full px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
                {data.blog.title}
              </h1>

              <p className="flex flex-wrap items-center gap-2 mb-2 text-sm sm:text-base">
                <span className="font-semibold">Décédé le</span>
                <FaRegCalendarAlt className="text-xl" />
                <span>{moment(data.blog.deathDate).format("DD-MM-YYYY")}</span>

                <span className="font-semibold">À</span>
                <span>{data.blog.placeOfDeath}</span>

                <span className="font-semibold">Par</span>
                <span>{data.blog.deathMethod}</span>

                <span className="font-semibold">À l'âge de</span>
                <span>{data.blog.age}</span>
                <span className="font-semibold">ans.</span>
              </p>
            </div>

            <div
              dangerouslySetInnerHTML={{
                __html: decode(data.blog.blogContent) || "",
              }}
            ></div>

            <div className="border-t mt-5 pt-5">
              <Comment props={{ blogid: data.blog._id }} />
            </div>
          </div>
        </>
      )}
      <div className="border rounded md:w-[30%] w-full p-5">
        <RelatedBlog props={{ category: category, currentBlog: blog }} />
      </div>
    </div>
  );
};

export default SingleBlogDetails;
