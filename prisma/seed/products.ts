import { Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/vi";
import { prisma } from "~/lib/db.server";

const PIZZA_PRODUCTS = [
  {
    name: "Pizza Hải Sản Pesto Xanh",
    shortDescription:
      "Pizza hải sản với sốt pesto từ lá húng tây tươi, phủ tôm, mực và các loại hải sản tươi ngon",
    detailDescription:
      "Một sự kết hợp độc đáo giữa sốt pesto xanh mát từ lá húng tây tươi, phô mai mozzarella béo ngậy cùng hải sản tươi ngon như tôm, mực, sò điệp. Được nướng trong lò với nhiệt độ cao, tạo nên lớp vỏ bánh giòn rụm, phần nhân đậm đà hương vị biển cả.",
    image: "pizza-hai-san-pesto.jpg",
  },
  {
    name: "Pizza 5 Loại Thịt Đặc Biệt",
    shortDescription:
      "Pizza với 5 loại thịt thượng hạng: pepperoni, xúc xích Ý, thịt xông khói, thịt bò, thịt heo",
    detailDescription:
      "Hương vị đậm đà từ 5 loại thịt thượng hạng: pepperoni cay nồng, xúc xích Ý đậm vị, thịt xông khói hun khói, thịt bò Úc và thịt heo nướng. Kết hợp với sốt cà chua đặc biệt và phô mai mozzarella béo ngậy.",
    image: "pizza-5-loai-thit.jpg",
  },
  {
    name: "Pizza Margherita Truyền Thống",
    shortDescription:
      "Pizza kiểu Ý truyền thống với sốt cà chua, phô mai mozzarella và lá húng quế tươi",
    detailDescription:
      "Một món pizza đơn giản nhưng đầy hương vị với sốt cà chua Ý thơm ngon, phô mai mozzarella thượng hạng và lá húng quế tươi. Được làm theo công thức truyền thống của Naples.",
    image: "pizza-margherita.jpg",
  },
  {
    name: "Pizza Gà Nướng BBQ",
    shortDescription:
      "Pizza với thịt gà nướng BBQ, hành tây, ớt chuông và sốt BBQ đặc biệt",
    detailDescription:
      "Thịt gà được ướp và nướng với sốt BBQ đậm đà, kết hợp với hành tây ngọt, ớt chuông tươi và phô mai mozzarella. Phủ thêm một lớp sốt BBQ đặc biệt tạo nên hương vị khó quên.",
    image: "pizza-ga-bbq.jpg",
  },
  {
    name: "Pizza Rau Củ Thuần Chay",
    shortDescription:
      "Pizza chay với các loại rau củ tươi ngon: nấm, ớt chuông, hành tây, ô liu",
    detailDescription:
      "Lựa chọn hoàn hảo cho người ăn chay với các loại rau củ tươi ngon như nấm, ớt chuông, hành tây, ô liu đen, cà chua bi. Sử dụng phô mai thuần chay đặc biệt.",
    image: "pizza-rau-cu.jpg",
  },
  {
    name: "Pizza Hawaii",
    shortDescription:
      "Pizza với thịt giăm bông, dứa tươi và sốt cà chua đặc biệt",
    detailDescription:
      "Sự kết hợp độc đáo giữa thịt giăm bông thượng hạng và dứa tươi ngọt, tạo nên hương vị ngọt-mặn hài hòa. Phủ phô mai mozzarella và sốt cà chua đặc biệt.",
    image: "pizza-hawaii.jpg",
  },
];

const PASTA_PRODUCTS = [
  {
    name: "Mỳ Ý Hải Sản",
    shortDescription:
      "Mỳ Ý với hải sản tươi sống, sốt kem tươi và phô mai parmesan",
    detailDescription:
      "Mỳ Ý được nấu vừa tới, kết hợp với hải sản tươi ngon như tôm, mực, sò điệp trong sốt kem tươi béo ngậy. Rắc phô mai parmesan và lá húng tây tươi.",
    image: "my-y-hai-san.jpg",
  },
  {
    name: "Mỳ Ý Sốt Bò Bằm",
    shortDescription: "Mỳ Ý với sốt bò bằm đậm đà kiểu Ý truyền thống",
    detailDescription:
      "Spaghetti với sốt bò bằm được nấu trong nhiều giờ theo công thức truyền thống của Ý, với cà chua, rau củ và các lo���i thảo mộc tươi.",
    image: "my-y-bo-bam.jpg",
  },
  {
    name: "Mỳ Ý Carbonara",
    shortDescription:
      "Mỳ Ý sốt kem với thịt xông khói, trứng và phô mai pecorino",
    detailDescription:
      "Món mỳ Ý truyền thống với sốt kem béo ngậy, thịt xông khói giòn, trứng và phô mai pecorino Romano. Hoàn thiện với tiêu đen xay.",
    image: "my-y-carbonara.jpg",
  },
  {
    name: "Mỳ Ý Cay Hải Sản",
    shortDescription: "Mỳ Ý với hải sản và sốt cà chua cay",
    detailDescription:
      "Mỳ Ý với tôm, mực, sò điệp trong sốt cà chua cay nồng. Thêm tỏi, ớt và rau mùi tạo nên hương vị đặc trưng.",
    image: "my-y-cay-hai-san.jpg",
  },
];

const SALAD_PRODUCTS = [
  {
    name: "Salad Caesar",
    shortDescription:
      "Salad trộn với sốt Caesar, thịt gà nướng, bánh mì nướng và phô mai parmesan",
    detailDescription:
      "Xà lách tươi giòn trộn với sốt Caesar đặc trưng, thịt gà nướng mềm ngọt, bánh mì nướng giòn và bào phô mai parmesan.",
    image: "salad-caesar.jpg",
  },
  {
    name: "Salad Cá Hồi Nauy",
    shortDescription:
      "Salad với cá hồi Na Uy áp chảo, bơ và sốt mù tạt mật ong",
    detailDescription:
      "Xà lách tươi với cá hồi Na Uy áp chảo, bơ, cà chua bi, hành tím, trộn với sốt mù tạt mật ong đặc biệt.",
    image: "salad-ca-hoi.jpg",
  },
  {
    name: "Salad Hy Lạp",
    shortDescription:
      "Salad kiểu Hy Lạp với phô mai feta, ô liu và sốt dầu giấm",
    detailDescription:
      "Salad truyền thống Hy Lạp với cà chua, dưa chuột, ớt chuông, hành tây, ô liu đen và phô mai feta. Trộn với sốt dầu ô liu và giấm đỏ.",
    image: "salad-hy-lap.jpg",
  },
  {
    name: "Salad Bơ Quinoa",
    shortDescription:
      "Salad bơ với hạt quinoa, rau củ tươi và sốt chanh dầu olive",
    detailDescription:
      "Salad healthy với quinoa, bơ, cà chua bi, dưa chuột, ớt chuông, hành tây đỏ. Trộn với sốt chanh dầu olive tươi mát.",
    image: "salad-bo-quinoa.jpg",
  },
];

const MATERIALS = [
  { name: "Bột mì số 13", unit: "kg", warningLimits: 50, image: "bot-mi.jpg" },
  {
    name: "Phô mai Mozzarella",
    unit: "kg",
    warningLimits: 30,
    image: "pho-mai.jpg",
  },
  {
    name: "Sốt cà chua",
    unit: "lít",
    warningLimits: 20,
    image: "sot-ca-chua.jpg",
  },
  { name: "Pepperoni", unit: "kg", warningLimits: 15, image: "pepperoni.jpg" },
  { name: "Tôm tươi", unit: "kg", warningLimits: 10, image: "tom.jpg" },
  { name: "Mực tươi", unit: "kg", warningLimits: 10, image: "muc.jpg" },
  { name: "Thịt bò Úc", unit: "kg", warningLimits: 20, image: "thit-bo.jpg" },
  { name: "Thịt heo", unit: "kg", warningLimits: 20, image: "thit-heo.jpg" },
  { name: "Xúc xích Ý", unit: "kg", warningLimits: 15, image: "xuc-xich.jpg" },
  { name: "Ớt chuông", unit: "kg", warningLimits: 10, image: "ot-chuong.jpg" },
  { name: "Nấm", unit: "kg", warningLimits: 10, image: "nam.jpg" },
];

const BORDERS = [
  { name: "Viền phô mai", price: 45000, image: "vien-pho-mai.jpg" },
  { name: "Viền xúc xích", price: 55000, image: "vien-xuc-xich.jpg" },
  { name: "Viền tôm", price: 60000, image: "vien-tom.jpg" },
];

export async function seedProducts(tx: Prisma.TransactionClient) {
  console.log("Seeding products and related data...");
  const productMedia = await tx.media.findMany({
    where: {
      type: "product",
    },
  });
  // Create sizes
  const sizes = [
    { name: 'Nhỏ 6"', image: "small.jpg" },
    { name: 'Vừa 9"', image: "medium.jpg" },
    { name: 'Lớn 12"', image: "large.jpg" },
  ];

  const createdSizes = await Promise.all(
    sizes.map((size) => tx.size.create({ data: size })),
  );

  // Create materials
  const createdMaterials = await Promise.all(
    MATERIALS.map((material) => tx.material.create({ data: material })),
  );

  // Create borders
  const createdBorders = await Promise.all(
    BORDERS.map((border) => tx.border.create({ data: border })),
  );

  // Create categories
  const categories = [
    { name: "Pizza", image: "pizza.jpg", slug: "pizza" },
    { name: "Pasta", image: "pasta.jpg", slug: "pasta" },
    { name: "Salad", image: "salad.jpg", slug: "salad" },
  ];

  const createdCategories = await Promise.all(
    categories.map((category) => tx.category.create({ data: category })),
  );

  // Create toppings based on materials
  const toppings = [
    {
      name: "Phô mai mozzarella",
      price: 20000,
      materialId: createdMaterials.find((m) => m.name === "Phô mai Mozzarella")!
        .id,
    },
    {
      name: "Pepperoni",
      price: 25000,
      materialId: createdMaterials.find((m) => m.name === "Pepperoni")!.id,
    },
    {
      name: "Tôm",
      price: 30000,
      materialId: createdMaterials.find((m) => m.name === "Tôm tươi")!.id,
    },
    {
      name: "Nấm",
      price: 15000,
      materialId: createdMaterials.find((m) => m.name === "Nấm")!.id,
    },
    {
      name: "Thịt bò",
      price: 30000,
      materialId: createdMaterials.find((m) => m.name === "Thịt bò Úc")!.id,
    },
  ];

  const createdToppings = await Promise.all(
    toppings.map((topping) => tx.topping.create({ data: topping })),
  );

  // Create products for each category
  const pizzaCategory = createdCategories.find((c) => c.name === "Pizza")!;
  const pastaCategory = createdCategories.find((c) => c.name === "Pasta")!;
  const saladCategory = createdCategories.find((c) => c.name === "Salad")!;

  // Helper function to round price to nearest 10000
  const roundPrice = (price: number) => Math.round(price / 10000) * 10000;

  // Create Pizza products
  for (const pizza of PIZZA_PRODUCTS) {
    const image = faker.helpers.arrayElement(productMedia)?.url;
    const product = await tx.product.create({
      data: {
        ...pizza,
        slug: faker.helpers.slugify(pizza.name).toLowerCase(),
        categoryId: pizzaCategory.id,
        image,
        image_mobile: image,
      },
    });

    // Add sizes with rounded prices
    for (const size of createdSizes) {
      await tx.productSize.create({
        data: {
          productId: product.id,
          sizeId: size.id,
          price: roundPrice(faker.number.int({ min: 100000, max: 300000 })),
        },
      });
    }

    // Add borders
    for (const border of createdBorders) {
      await tx.productBorder.create({
        data: {
          productId: product.id,
          borderId: border.id,
        },
      });
    }

    // Add toppings
    for (const topping of createdToppings) {
      await tx.productTopping.create({
        data: {
          productId: product.id,
          toppingId: topping.id,
        },
      });
    }

    // Add recipes
    await Promise.all(
      [
        {
          materialId: createdMaterials.find((m) => m.name === "Bột mì số 13")!
            .id,
          quantity: 0.3,
        },
        {
          materialId: createdMaterials.find(
            (m) => m.name === "Phô mai Mozzarella",
          )!.id,
          quantity: 0.2,
        },
        {
          materialId: createdMaterials.find((m) => m.name === "Sốt cà chua")!
            .id,
          quantity: 0.15,
        },
      ].map((recipe) =>
        tx.recipe.create({
          data: {
            productId: product.id,
            materialId: recipe.materialId,
            quantity: recipe.quantity,
          },
        }),
      ),
    );
  }

  // Create Pasta products
  for (const pasta of PASTA_PRODUCTS) {
    const product = await tx.product.create({
      data: {
        ...pasta,
        slug: faker.helpers.slugify(pasta.name).toLowerCase(),
        categoryId: pastaCategory.id,
      },
    });

    // Add sizes with rounded prices (chỉ có 1 size cho pasta)
    await tx.productSize.create({
      data: {
        productId: product.id,
        sizeId: createdSizes[1].id, // Size vừa
        price: roundPrice(faker.number.int({ min: 80000, max: 150000 })),
      },
    });

    // Add recipes cho pasta
    await Promise.all(
      [
        {
          materialId: createdMaterials.find((m) => m.name === "Bột mì số 13")!
            .id,
          quantity: 0.2,
        },
        {
          materialId: createdMaterials.find((m) => m.name === "Sốt cà chua")!
            .id,
          quantity: 0.1,
        },
        {
          materialId: createdMaterials.find(
            (m) => m.name === "Phô mai Mozzarella",
          )!.id,
          quantity: 0.1,
        },
      ].map((recipe) =>
        tx.recipe.create({
          data: {
            productId: product.id,
            materialId: recipe.materialId,
            quantity: recipe.quantity,
          },
        }),
      ),
    );
  }

  // Create Salad products
  for (const salad of SALAD_PRODUCTS) {
    const product = await tx.product.create({
      data: {
        ...salad,
        slug: faker.helpers.slugify(salad.name).toLowerCase(),
        categoryId: saladCategory.id,
      },
    });

    // Add sizes with rounded prices (chỉ có 1 size cho salad)
    await tx.productSize.create({
      data: {
        productId: product.id,
        sizeId: createdSizes[0].id, // Size nhỏ
        price: roundPrice(faker.number.int({ min: 50000, max: 120000 })),
      },
    });

    // Add recipes cho salad (không cần nhiều nguyên liệu như pizza)
    await Promise.all(
      [
        {
          materialId: createdMaterials.find((m) => m.name === "Ớt chuông")!.id,
          quantity: 0.1,
        },
        {
          materialId: createdMaterials.find((m) => m.name === "Nấm")!.id,
          quantity: 0.1,
        },
      ].map((recipe) =>
        tx.recipe.create({
          data: {
            productId: product.id,
            materialId: recipe.materialId,
            quantity: recipe.quantity,
          },
        }),
      ),
    );
  }

  console.log("✅ Products and related data seeded!");
}
