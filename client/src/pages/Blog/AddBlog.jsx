import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import slugify from "slugify";
import { showToast } from "@/helpers/showToast";
import { getEvn } from "@/helpers/getEnv";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetch } from "@/hooks/useFetch";
import Dropzone from "react-dropzone";
import Editor from "@/components/Editor";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteBlog } from "@/helpers/RouteName";
import { categoryAPI } from "@/services/api";

const AddBlog = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories using the API service
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getAllCategories();
        setCategoryData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const [filePreview, setPreview] = useState();
  const [file, setFile] = useState();

  const formSchema = z.object({
    category: z.string().min(3, "Category must be at least 3 character long."),
    title: z.string().min(3, "Title must be at least 3 character long."),
    slug: z.string().min(3, "Slug must be at least 3 character long."),
    blogContent: z
      .string()
      .min(3, "Blog content must be at least 3 character long."),
    age: z
      .number({ required_error: "L'âge est requis" })
      .min(0, "L'âge doit être au moins 1 mois")
      .max(120, "L'âge ne peut pas dépasser 120"),
    deathDate: z
      .string()
      .nullable()
      .optional()
      .refine(
        (date) => {
          if (!date) return true; // Allow null values
          const selectedDate = new Date(date);
          const today = new Date();
          return selectedDate <= today; // Ensure it's today or in the past
        },
        { message: "La date de décès doit être aujourd'hui ou dans le passé." }
      ),
    placeOfDeath: z
      .string()
      .min(3, "Place of death must be at least 3 characters long."),

    deathMethod: z
      .string()
      .min(3, "Category must be at least 3 character long."),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      title: "",
      slug: "",
      blogContent: "",
      age: "", // Ensure it starts as a number
      deathDate: null,
      placeOfDeath: "",
      deathMethod: "",
    },
  });

  const handleEditorData = (event, editor) => {
    const data = editor.getData();
    form.setValue("blogContent", data);
  };

  const blogTitle = form.watch("title");

  useEffect(() => {
    if (blogTitle) {
      const slug = slugify(blogTitle, { lower: true });
      form.setValue("slug", slug);
    }
  }, [blogTitle]);

  async function onSubmit(values) {
    try {
      const newValues = { ...values, author: user.user._id };
      if (!file) {
        showToast("error", "Feature image required.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("data", JSON.stringify(newValues));

      const response = await fetch(`${getEvn("VITE_API_BASE_URL")}/blog/add`, {
        method: "post",
        credentials: "include",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        return showToast("error", data.message);
      }
      form.reset();
      setFile();
      setPreview();
      navigate(RouteBlog);
      showToast("success", data.message);
    } catch (error) {
      showToast("error", error.message);
    }
  }

  const handleFileSelection = (files) => {
    const file = files[0];
    const preview = URL.createObjectURL(file);
    setFile(file);
    setPreview(preview);
  };

  return (
    <div>
      <Card className="pt-5">
        <CardContent>
          <h1 className="text-2xl font-bold mb-4">Nous n'oublierons Jamais </h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="mb-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet de la victime</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Entrer le Nom Complet de la Victime"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-3">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identifiant unique de la victime</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Identifiant unique de la victime"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexe de la victime</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sexe de la victime" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryData &&
                              categoryData.category.length > 0 &&
                              categoryData.category.map((category) => (
                                <SelectItem
                                  key={category._id}
                                  value={category._id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Age */}
              <div className="mb-3">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Victim's Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter age of the victim"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseInt(e.target.value, 10)
                              : "";
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-3">
                <FormField
                  name="deathDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de Décès</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ""} // Ensure it's not null or undefined
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          } // Allow clearing
                          max={new Date().toISOString().split("T")[0]} // Restrict future dates
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-3">
                <FormField
                  name="placeOfDeath"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu du Décès</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-3">
                <FormField
                  control={form.control}
                  name="deathMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment la victime est-elle morte ?</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez la méthode de décès" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="balle">Par balle</SelectItem>
                            <SelectItem value="strangulation">
                              Par strangulation
                            </SelectItem>
                            <SelectItem value="kidnaping">
                              Par Enlevement
                            </SelectItem>
                            <SelectItem value="torture">Par torture</SelectItem>
                            <SelectItem value="viol">Par viol</SelectItem>
                            <SelectItem value="noyade">Par noyade</SelectItem>
                            <SelectItem value="coups">Par coups</SelectItem>
                            <SelectItem value="mutilation">
                              Par mutilation
                            </SelectItem>
                            <SelectItem value="bombardement">
                              Par bombardement
                            </SelectItem>
                            <SelectItem value="fonction">
                              Dans l'exercice de ses fonctions
                            </SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-3">
                <span className="mb-2 block">Portrait de la Victime</span>
                <Dropzone
                  onDrop={(acceptedFiles) => handleFileSelection(acceptedFiles)}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <div className="flex justify-center items-center w-36 h-28 border-2 border-dashed rounded">
                        <img src={filePreview} />
                      </div>
                    </div>
                  )}
                </Dropzone>
              </div>

              <div className="mb-3">
                <FormField
                  control={form.control}
                  name="blogContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hommage et mémoire à la victime</FormLabel>
                      <FormControl>
                        <Editor
                          props={{
                            initialData: "",
                            onChange: handleEditorData,
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Rendre hommage
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBlog;
