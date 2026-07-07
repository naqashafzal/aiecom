const { createProduct } = require('./.next/server/app/admin/actions.js') || {};
const fs = require('fs');

async function test() {
  try {
    const formData = new FormData();
    formData.append("name", "Test");
    formData.append("description", "Desc");
    formData.append("price", "10");
    formData.append("stock", "5");
    formData.append("status", "ACTIVE");
    formData.append("categoryIds", "cat1");
    // Mock image
    const blob = new Blob(["test"], { type: 'image/jpeg' });
    blob.name = "test.jpg";
    // We cannot easily create a File object in pure Node.js, but let's try
    formData.append("image", new File(["test"], "test.jpg", { type: "image/jpeg" }));

    await createProduct(formData);
  } catch (err) {
    console.error("Caught error:", err);
  }
}
test();
