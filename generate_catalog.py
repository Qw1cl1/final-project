import json
import random
import os

path = './data/products.json'

with open(path, 'r', encoding='utf-8') as f:
    products = json.load(f)

existing_ids = {p['id'] for p in products}
next_id = 61

def generate_id():
    global next_id
    new_id = f"p{next_id}"
    next_id += 1
    return new_id

# Templates
brands_phones = ["Samsung", "Xiaomi", "POCO", "Realme", "Tecno", "Infinix", "Huawei", "Honor"]
memories = ["4/64 ГБ", "8/128 ГБ", "8/256 ГБ", "12/256 ГБ", "12/512 ГБ", "16/1 ТБ"]
colors = ["черный", "белый", "синий", "зеленый", "серый", "серебристый", "фиолетовый"]

brands_laptops = ["ASUS", "MSI", "Acer", "Lenovo", "HP", "Dell", "Huawei", "Honor", "Maibenben"]
processors_lap = ["i3", "i5", "i7", "Ryzen 5", "Ryzen 7"]
rams = ["8GB", "16GB", "32GB"]
gpus_lap = ["Intel Iris Xe", "RTX 3050", "RTX 4050", "RTX 4060", "RTX 4070"]

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

images = [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1527814050087-37938154798f?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1589824781470-7bb9fe6add39?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1585659722983-3a6750f2fd82?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1517488629431-6427e02d72f1?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1612282130134-4b53fa497ef0?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1606318801954-d46d46d3360a?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80"
]

def generate_phones(count):
    res = []
    for _ in range(count):
        brand = random.choice(brands_phones)
        model = f"Series {random.randint(10, 30)} Pro"
        mem = random.choice(memories)
        color = random.choice(colors)
        price = random.randint(9, 89) * 1000 + 999
        res.append({
            "id": generate_id(),
            "name": f"Смартфон {brand} {model} {mem} {color}",
            "category": "Смартфоны",
            "price": price,
            "oldPrice": price + random.randint(2, 10)*1000 if random.random() > 0.6 else None,
            "rating": round(random.uniform(4.2, 5.0), 1),
            "reviews": random.randint(10, 2000),
            "image": random.choice(images),
            "specs": {"Экран": f"6.{random.randint(4,8)}\" AMOLED", "Память": mem, "Камера": f"{random.choice([50, 64, 108, 200])} Мп"},
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
        price = random.randint(35, 150) * 1000 + 999
        res.append({
            "id": generate_id(),
            "name": f"Ноутбук {brand} 15.6\" / {proc} / {ram} / {gpu}",
            "category": "Ноутбуки",
            "price": price,
            "oldPrice": price + random.randint(5, 15)*1000 if random.random() > 0.6 else None,
            "rating": round(random.uniform(4.4, 4.9), 1),
            "reviews": random.randint(5, 800),
            "image": random.choice(images),
            "specs": {"Экран": "15.6\" IPS", "Процессор": proc, "ОЗУ": ram, "Видеокарта": gpu},
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
        price = random.randint(15, 120) * 1000 + 999
        res.append({
            "id": generate_id(),
            "name": f"Телевизор LED {brand} {diag} Smart TV",
            "category": "Телевизоры",
            "price": price,
            "oldPrice": price + random.randint(3, 15)*1000 if random.random() > 0.6 else None,
            "rating": round(random.uniform(4.5, 5.0), 1),
            "reviews": random.randint(20, 1500),
            "image": random.choice(images),
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
        price = random.randint(2, 40) * 1000 + 999
        res.append({
            "id": generate_id(),
            "name": f"{type_} {brand} PRO Series {random.randint(100, 900)}",
            "category": "Комплектующие",
            "price": price,
            "oldPrice": price + random.randint(1, 5)*1000 if random.random() > 0.6 else None,
            "rating": round(random.uniform(4.6, 5.0), 1),
            "reviews": random.randint(10, 1000),
            "image": random.choice(images),
            "specs": {"Бренд": brand, "Тип": type_},
            "description": f"Надежное решение от {brand} для сборки мощного ПК.",
            "isNew": random.random() > 0.8,
            "isPopular": random.random() > 0.5
        })
    return res

def generate_others(count, cats, brands, category_name):
    res = []
    for _ in range(count):
        type_ = random.choice(cats)
        brand = random.choice(brands)
        price = random.randint(1, 30) * 1000 + 999
        res.append({
            "id": generate_id(),
            "name": f"{type_} {brand} Model {random.randint(10, 99)}",
            "category": category_name,
            "price": price,
            "oldPrice": price + random.randint(1, 4)*1000 if random.random() > 0.6 else None,
            "rating": round(random.uniform(4.3, 4.9), 1),
            "reviews": random.randint(50, 3000),
            "image": random.choice(images),
            "specs": {"Бренд": brand, "Тип": type_},
            "description": f"Качественный товар от проверенного бренда {brand}.",
            "isNew": random.random() > 0.8,
            "isPopular": random.random() > 0.5
        })
    return res

# Generate 350 items total
products.extend(generate_phones(60))
products.extend(generate_laptops(50))
products.extend(generate_tvs(40))
products.extend(generate_components(80))
products.extend(generate_others(50, periph, periph_brands, "Периферия"))
products.extend(generate_others(40, smart_home, smart_brands, "Умный дом"))
products.extend(generate_others(30, home_app, home_brands, "Бытовая техника"))

with open(path, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"Successfully generated total {len(products)} products.")
