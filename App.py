import sqlite3
import pandas as pd
import streamlit as st

# Page Configuration
st.set_page_config(
    page_title="Agricultural Packaging Inventory",
    page_icon="📦",
    layout="wide",
)

# Custom Styling for Clean Look (ড্যাশবোর্ড ও কার্ডের ডিজাইন উন্নত করার জন্য)
st.markdown(
    """
    <style>
    .main { background-color: #f4f6f9; }
    .stMetric { background-color: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-left: 5px solid #2e7d32; }
    .stForm { background-color: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    h1, h2, h3 { color: #1b5e20; }
    </style>
""",
    unsafe_allow_html=True,
)

# ডাটাবেজ কানেকশন এবং টেবিল তৈরি
conn = sqlite3.connect("sales_data.db")
cursor = conn.cursor()
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer TEXT,
        product TEXT,
        quantity INTEGER,
        total_amount REAL,
        profit REAL
    )
"""
)
conn.commit()

# ডাটাবেজ থেকে আগের সব সেলস ডেটা লোড করা
sales_data_from_db = cursor.execute(
    "SELECT customer, product, quantity, total_amount, profit FROM sales"
).fetchall()

# সেশন স্টেটে ডেটাগুলো যুক্ত করা যাতে অ্যাপে শো করে
st.session_state.sales = []
for row in sales_data_from_db:
  st.session_state.sales.append({
      "Customer": row[0],
      "Product": row[1],
      "Quantity": row[2],
      "Total Amount": row[3],
      "Profit": row[4],
  })

# Initialize Products Data based on User Input
if "products" not in st.session_state:
  st.session_state.products = [
      # Crate & Paper & General Items
      {
          "id": 1,
          "name": "ক্যারেট - ১নং",
          "category": "ক্যারেট",
          "buy_price": 260,
          "sell_price": 300,
          "unit": "পিস",
          "stock": 50,
      },
      {
          "id": 2,
          "name": "ক্যারেট - ২নং",
          "category": "ক্যারেট",
          "buy_price": 180,
          "sell_price": 200,
          "unit": "পিস",
          "stock": 50,
      },
      {
          "id": 3,
          "name": "রিম (বড় সাদা কাগজ)",
          "category": "কাগজ",
          "buy_price": 50,
          "sell_price": 68,
          "unit": "কেজি",
          "stock": 100,
      },
      {
          "id": 4,
          "name": "কফি রিম (ছোট সাদা কাগজ)",
          "category": "কাগজ",
          "buy_price": 60,
          "sell_price": 80,
          "unit": "কেজি",
          "stock": 100,
      },
      {
          "id": 5,
          "name": "পেপার",
          "category": "কাগজ",
          "buy_price": 55,
          "sell_price": 70,
          "unit": "কেজি",
          "stock": 100,
      },
      {
          "id": 6,
          "name": "ফরমা",
          "category": "কাগজ",
          "buy_price": 50,
          "sell_price": 70,
          "unit": "কেজি",
          "stock": 100,
      },
      {
          "id": 7,
          "name": "সুতলি",
          "category": "অন্যান্য",
          "buy_price": 210,
          "sell_price": 240,
          "unit": "কেজি",
          "stock": 100,
      },
      {
          "id": 8,
          "name": "কাকড়া",
          "category": "অন্যান্য",
          "buy_price": 117,
          "sell_price": 150,
          "unit": "কেজি",
          "stock": 100,
      },
      {
          "id": 9,
          "name": "চান্দি",
          "category": "অন্যান্য",
          "buy_price": 9,
          "sell_price": 15,
          "unit": "পিস",
          "stock": 200,
      },
      {
          "id": 10,
          "name": "বেল্ট",
          "category": "অন্যান্য",
          "buy_price": 32,
          "sell_price": 42,
          "unit": "পিস",
          "stock": 200,
      },
      {
          "id": 11,
          "name": "ফম",
          "category": "অন্যান্য",
          "buy_price": 1,
"sell_price": 2,
          "unit": "পিস",
          "stock": 500,
      },
      {
          "id": 12,
          "name": "কাটুন",
          "category": "অন্যান্য",
          "buy_price": 65,
          "sell_price": 70,
          "unit": "জোড়া",
          "stock": 50,
      },
      # Sacks (Water, White, Blue, Net)
      {
          "id": 13,
          "name": "পানি - ২৪/৪২ (🟢 উপলব্ধ)",
          "category": "বস্তা (পানি)",
          "buy_price": 21,
          "sell_price": 28,
          "unit": "পিস",
          "stock": 150,
      },
      {
          "id": 14,
          "name": "পানি - ২৮/৪৫ (🟢 উপলব্ধ)",
          "category": "বস্তা (পানি)",
          "buy_price": 26,
          "sell_price": 33,
          "unit": "পিস",
          "stock": 150,
      },
      {
          "id": 15,
          "name": "পানি - ২৮/৪৪ (🟢 উপলব্ধ)",
          "category": "বস্তা (পানি)",
          "buy_price": 26,
          "sell_price": 33,
          "unit": "পিস",
          "stock": 150,
      },
      {
          "id": 16,
          "name": "পানি - ২৮/৪৮ (🟢 উপলব্ধ)",
          "category": "বস্তা (পানি)",
          "buy_price": 28,
          "sell_price": 34,
          "unit": "পিস",
          "stock": 150,
      },
      {
          "id": 17,
          "name": "পানি - ৩০/৫২ (🔴 স্টক নেই)",
          "category": "বস্তা (পানি)",
          "buy_price": 0,
          "sell_price": 0,
          "unit": "পিস",
          "stock": 0,
      },
      {
          "id": 18,
          "name": "সাদা - ২৮/৪৬ (🔴 স্টক নেই)",
          "category": "বস্তা (সাদা)",
          "buy_price": 0,
          "sell_price": 0,
          "unit": "পিস",
          "stock": 0,
      },
      {
          "id": 19,
          "name": "সাদা - ২৮/৪৮ (🔴 স্টক নেই)",
          "category": "বস্তা (সাদা)",
          "buy_price": 0,
          "sell_price": 0,
          "unit": "পিস",
          "stock": 0,
      },
      {
          "id": 20,
          "name": "সাদা - ৩০/৫২ (🟢 উপলব্ধ)",
          "category": "বস্তা (সাদা)",
          "buy_price": 32,
          "sell_price": 38,
          "unit": "পিস",
          "stock": 150,
      },
      {
          "id": 21,
          "name": "সাদা - ৩২/৫৬ (🟢 উপলব্ধ)",
          "category": "বস্তা (সাদা)",
          "buy_price": 30,
          "sell_price": 40,
          "unit": "পিস",
          "stock": 150,
      },
      {
          "id": 22,
          "name": "নিল - ২৮/৪৮ (🟢 উপলব্ধ)",
          "category": "বস্তা (নিল)",
          "buy_price": 27,
          "sell_price": 34,
          "unit": "পিস",
          "stock": 150,
      },
      {
          "id": 23,
          "name": "নিল - ৩০/৫২ (🔴 স্টক নেই)",
          "category": "বস্তা (নিল)",
          "buy_price": 0,
          "sell_price": 0,
          "unit": "পিস",
          "stock": 0,
      },
      {
          "id": 24,
          "name": "নেট - ২২/৩৮ (🟢 উপলব্ধ)",
          "category": "বস্তা (নেট)",
          "buy_price": 21,
          "sell_price": 26,
          "unit": "পিস",
          "stock": 150,
      },
      {
          "id": 25,
          "name": "নেট - ২৪/৩৬ (🔴 স্টক নেই)",
          "category": "বস্তা (নেট)",
          "buy_price": 0,
          "sell_price": 0,
          "unit": "পিস",
          "stock": 0,
      },
      {
          "id": 26,
          "name": "নেট - ২৪/৪০ (🟢 উপলব্ধ)",
          "category": "বস্তা (নেট)",
          "buy_price": 24,
          "sell_price": 28,
          "unit": "পিস",
          "stock": 150,
      },
      {
          "id": 27,
          "name": "নেট - ২৮/৪৬ (🟢 উপলব্ধ)",
          "category": "বস্তা (নেট)",
          "buy_price": 25,
          "sell_price": 30,
          "unit": "পিস",
          "stock": 150,
      },
      {
          "id": 28,
          "name": "নেট - ৩০/৫২ (🟢 উপলব্ধ)",
          "category": "বস্তা (নেট)",
          "buy_price": 26,
"sell_price": 34,
          "unit": "পিস",
          "stock": 150,
      },
      {
          "id": 29,
          "name": "নেট - ৩২/৫৬ (🟢 উপলব্ধ)",
          "category": "বস্তা (নেট)",
          "buy_price": 34,
          "sell_price": 40,
          "unit": "পিস",
          "stock": 150,
      },
  ]

if "sales" not in st.session_state:
  st.session_state.sales = []

# Sidebar Navigation
st.sidebar.title("📦 প্যাকেজিং হিসাব")
menu = st.sidebar.selectbox(
    "মেনু নির্বাচন করুন",
    ["ড্যাশবোর্ড ও বিক্রি", "পণ্যের তালিকা ও দাম", "বিক্রির ইতিহাস"],
)

# Filter out out-of-stock items for sales
available_products = [
    p for p in st.session_state.products if "🟢" in p["name"] or p["buy_price"] > 0
