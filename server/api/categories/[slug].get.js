export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  let category = null;
  try {
    const response = await getCategories({ slug });
    if (response.success && response.data?.length) category = response.data[0];
  } catch (error) {
    console.error("Failed to fetch category:", error);
  }

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: "Category not found" });
  }

  return category;
});
