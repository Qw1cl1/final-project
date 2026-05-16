import json
import random
import os

path = './data/products.json'

with open(path, 'r', encoding='utf-8') as f:
    products = json.load(f)

# Keep only the original 30 manually crafted items (or up to p30)
# Actually, the user had some manually added items. Let's keep items with ID from p1 to p30.
original_products = [p for p in products if p['id'].startswith('p') and int(p['id'][1:]) <= 30]

next_id = 31

def generate_id():
    global next_id
    new_id = f"p{next_id}"
    next_id += 1
    return new_id

# Image pools by category
img_phones = [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbff?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=500&q=80"
]

img_laptops = [
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=500&q=80"
]

img_tvs = [
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=500&q=80"
]

img_components = [
    "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1624701928517-44c8ac49d93c?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=500&q=80"
]

img_periph = [
    "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1527814050087-37938154798f?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1552831388-6a0b35077328?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1605810730452-9f64e26ee823?auto=format&fit=crop&w=500&q=80"
]

img_smart = [
    "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1589824781470-7bb9fe6add39?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=500&q=80"
]

img_home = [
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1585659722983-3a6750f2fd82?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1517488629431-6427e02d72f1?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80"
]

# Templates
brands_phones = ["Samsung", "Xiaomi", "POCO", "Realme", "Tecno", "Infinix", "Huawei", "Honor", "Apple"]
memories = ["4/64 ГБ", "8/128 ГБ", "8/256 ГБ", "12/256 ГБ", "12/512 ГБ", "16/1 ТБ"]
colors = ["черный", "белый", "синий", "зеленый", "серый", "серебристый", "фиолетовый", "титан"]

brands_laptops = ["ASUS", "MSI", "Acer", "Lenovo", "HP", "Dell", "Huawei", "Honor", "Maibenben", "Apple"]
processors_lap = ["i3", "i5", "i7", "i9", "Ryzen 5", "Ryzen 7", "Ryzen 9", "M1", "M2", "M3"]
rams = ["8GB", "16GB", "32GB", "64GB"]
gpus_lap = ["Intel Iris Xe", "RTX 3050", "RTX 4050", "RTX 4060", "RTX 4070", "RTX 4080"]

brands_tvs = ["Samsung", "LG", "TCL", "Hisense", "Xiaomi", "Haier", "DEXP", "Philips"]
diagonals = ["32\"", "43\"", "50\"", "55\"", "65\"", "75\"", "85\""]

components = ["Материнская плата", "Видеокарта", "Оперативная память", "SSD накопитель", "Блок питания", "Корпус"]
comp_brands = ["GIGABYTE", "MSI", "ASUS", "Palit", "Kingston", "Samsung", "Deepcool", "Cougar", "Chieftec"]

periph = ["Мышь", "Клавиатура", "Гарнитура", "Монитор", "Микрофон"]
periph_brands = ["Logitech", "Razer", "HyperX", "Ardor Gaming", "AOC", "LG", "Fifine", "Redragon"]

smart_home = ["Умная лампа", "Датчик движения", "Умная розетка", "IP-камера", "Робот-пылесос", "Умная колонка"]
smart_brands = ["Xiaomi", "Яндекс", "Aqara", "Tapo", "Sber", "VK"]

home_app = ["Холодильник", "Стиральная машина", "Микроволновая печь", "Кофемашина", "Пылесос", "Блендер"]
home_brands = ["Indesit", "Beko", "Haier", "Bosch", "LG", "Samsung", "DeLonghi", "Tefal", "DEXP"]


def generate_phones(count):
    res = []
    for _ in range(count):
        brand = random.choice(brands_phones)
        model = f"Series {random.randint(10, 30)} Pro"
        if brand == "Apple": model = f"iPhone {random.randint(11, 15)} Pro Max"
        mem = random.choice(memories)
        color = random.choice(colors)
        price = random.randint(9, 149) * 1000 + 999
        res.append({
            "id": generate_id(),
            "name": f"Смартфон {brand} {model} {mem} {color}",
            "category": "Смартфоны",
            "price": price,
            "oldPrice": price + random.randint(2, 10)*1000 if random.random() > 0.6 else None,
            "rating": round(random.uniform(4.2, 5.0), 1),
            "reviews": random.randint(10, 2000),
            "image": random.choice(img_phones),
            "specs": {"Экран": f"6.{random.randint(1,8)}\" AMOLED/OLED", "Память": mem, "Камера": f"{random.choice([12, 48, 50, 64, 108, 200])} Мп"},
            "description": f"Отличный смартфон от {brand} с современным дизайном и мощной камерой.",
            "isNew": random.random() > 0.8,
            "isPopular": random.random() > 0.5
        })
    return res

def generate_laptops(count):
    res = []
    for _ in range(count):
        brand = random.choice(brands_laptops)
        proc = random.choice(processors_lap)
        ram = random.choice(rams)
        gpu = random.choice(gpus_lap)
        price = random.randint(35, 250) * 1000 + 999
        res.append({
            "id": generate_id(),
            "name": f"Ноутбук {brand} 15.6\" / {proc} / {ram} / {gpu}",
            "category": "Ноутбуки",
            "price": price,
            "oldPrice": price + random.randint(5, 20)*1000 if random.random() > 0.6 else None,
            "rating": round(random.uniform(4.4, 4.9), 1),
            "reviews": random.randint(5, 800),
            "image": random.choice(img_laptops),
            "specs": {"Экран": "15.6\" IPS/OLED", "Процессор": proc, "ОЗУ": ram, "Видеокарта": gpu},
            "description": f"Производительный ноутбук {brand} для работы, учебы и развлечений.",
            "isNew": random.random() > 0.8,
            "isPopular": random.random() > 0.5
        })
    return res

def generate_tvs(count):
    res = []
    for _ in range(count):
        brand = random.choice(brands_tvs)
        diag = random.choice(diagonals)
        price = random.randint(15, 250) * 1000 + 999
        res.append({
            "id": generate_id(),
            "name": f"Телевизор LED {brand} {diag} Smart TV",
            "category": "Телевизоры",
            "price": price,
            "oldPrice": price + random.randint(3, 20)*1000 if random.random() > 0.6 else None,
            "rating": round(random.uniform(4.5, 5.0), 1),
            "reviews": random.randint(20, 1500),
            "image": random.choice(img_tvs),
            "specs": {"Диагональ": diag, "Разрешение": "4K UHD", "Smart TV": "Есть"},
            "description": f"Современный 4K телевизор {brand} с широким экраном {diag}.",
            "isNew": random.random() > 0.8,
            "isPopular": random.random() > 0.5
        })
    return res

def generate_components(count):
    res = []
    for _ in range(count):
        type_ = random.choice(components)
        brand = random.choice(comp_brands)
        price = random.randint(2, 80) * 1000 + 999
        res.append({
            "id": generate_id(),
            "name": f"{type_} {brand} PRO Series {random.randint(100, 900)}",
            "category": "Комплектующие",
            "price": price,
            "oldPrice": price + random.randint(1, 10)*1000 if random.random() > 0.6 else None,
            "rating": round(random.uniform(4.6, 5.0), 1),
            "reviews": random.randint(10, 1000),
            "image": random.choice(img_components),
            "specs": {"Бренд": brand, "Тип": type_},
            "description": f"Надежное решение от {brand} для сборки мощного ПК.",
            "isNew": random.random() > 0.8,
            "isPopular": random.random() > 0.5
        })
    return res

def generate_others(count, cats, brands, category_name, images_pool):
    res = []
    for _ in range(count):
        type_ = random.choice(cats)
        brand = random.choice(brands)
        price = random.randint(1, 40) * 1000 + 999
        res.append({
            "id": generate_id(),
            "name": f"{type_} {brand} Model {random.randint(10, 99)}",
            "category": category_name,
            "price": price,
            "oldPrice": price + random.randint(1, 5)*1000 if random.random() > 0.6 else None,
            "rating": round(random.uniform(4.3, 4.9), 1),
            "reviews": random.randint(50, 3000),
            "image": random.choice(images_pool),
            "specs": {"Бренд": brand, "Тип": type_},
            "description": f"Качественный товар от проверенного бренда {brand}.",
            "isNew": random.random() > 0.8,
            "isPopular": random.random() > 0.5
        })
    return res

# Generate 450 items total
original_products.extend(generate_phones(70))
original_products.extend(generate_laptops(70))
original_products.extend(generate_tvs(60))
original_products.extend(generate_components(100))
original_products.extend(generate_others(60, periph, periph_brands, "Периферия", img_periph))
original_products.extend(generate_others(50, smart_home, smart_brands, "Умный дом", img_smart))
original_products.extend(generate_others(40, home_app, home_brands, "Бытовая техника", img_home))

with open(path, 'w', encoding='utf-8') as f:
    json.dump(original_products, f, ensure_ascii=False, indent=2)

print(f"Successfully generated total {len(original_products)} products.")
