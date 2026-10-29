import sqlite3
import pandas as pd
import streamlit as st

# ডাটাবেস কানেকশন এবং টেবিল তৈরি
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

# Page Configuration
st.set_page_config(
    page_title="Agricultural Packaging Inventory",
    page_icon="📦",
    layout="wide",
)

# Custom Styling for Clean Look
st.markdown(
    """
    <style>
    .main { background-color: #f8f9fa; }
    .stMetric { background-color: #ffffff; padding: 15px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    </style>
""",
    unsafe_allow_html=True,
)

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
[10/29/2026 9:21 PM] @: "unit": "জোড়া",
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
[10/29/2026 9:21 PM] @: # Sidebar Navigation
st.sidebar.title("📦 প্যাকেজিং হিসাব")
menu = st.sidebar.selectbox(
    "মেনু নির্বাচন করুন",
    ["ড্যাশবোর্ড ও বিক্রি", "পণ্যের তালিকা ও দাম", "বিক্রির ইতিহাস"],
)

# Filter out out-of-stock items for sales
available_products = [
    p for p in st.session_state.products if "🟢" in p["name"] or p["buy_price"] > 0
]

if menu == "ড্যাশবোর্ড ও বিক্রি":
  st.title("🛍 নতুন বিক্রি এন্ট্রি ও ড্যাশবোর্ড")

  col1, col2, col3 = st.columns(3)
  total_products = len(st.session_state.products)
  active_sales_count = len(st.session_state.sales)
  total_revenue = sum([s["Total Amount"] for s in st.session_state.sales])

  col1.metric("মোট পণ্যের ধরন", f"{total_products} টি")
  col2.metric("মোট বিক্রির হিসাব", f"{active_sales_count} বার")
  col3.metric("মোট বিক্রয়মূল্য", f"৳ {total_revenue}")

  st.markdown("---")

  st.subheader("📝 নতুন কাস্টমার সেলস এন্ট্রি")
  with st.form("sales_form"):
    customer_name = st.text_input("কাস্টমারের নাম")

    product_options = {p["name"]: p for p in available_products}
    selected_product_name = st.selectbox(
        "পণ্য নির্বাচন করুন", list(product_options.keys())
    )

    selected_product = product_options[selected_product_name]
    st.info(
        f"ক্রয়মূল্য: ৳{selected_product['buy_price']} | বিক্রয়মূল্য:"
        f" ৳{selected_product['sell_price']} প্রতি {selected_product['unit']}"
    )

    quantity = st.number_input(
        f"পরিমাণ ({selected_product['unit']})",
        min_value=1.0,
        value=1.0,
        step=1.0,
    )

    submitted = st.form_submit_button("বিক্রি নিশ্চিত করুন")

    if submitted:
      if not customer_name:
        st.error("দয়া করে কাস্টমারের নাম লিখুন!")
      else:
        total_amount = quantity * selected_product["sell_price"]
        total_cost = quantity * selected_product["buy_price"]
        profit = total_amount - total_cost

        sale_record = {
            "Customer": customer_name,
            "Product": selected_product["name"],
            "Quantity": quantity,
            "Unit": selected_product["unit"],
            "Total Amount": total_amount,
            "Profit": profit,
            "Date": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M"),
        }
        st.session_state.sales.append(sale_record)

        # ডাটাবেসে সঠিকভাবে নাম সংরক্ষণ করার জন্য selected_product['name'] দেওয়া হয়েছে
        cursor.execute(
            """
            INSERT INTO sales (customer, product, quantity, total_amount, profit)
            VALUES (?, ?, ?, ?, ?)
        """,
            (
                customer_name,
                selected_product["name"],
                quantity,
                total_amount,
                profit,
            ),
        )
        conn.commit()
        st.success(
            f"সফলভাবে {customer_name}-এর কাছে বিক্রি এন্ট্রি করা হয়েছে!"
        )

elif menu == "পণ্যের তালিকা ও দাম":
  st.title("📋 পণ্যের স্টক ও মূল্য তালিকা")

  df_products = pd.DataFrame(st.session_state.products)
  st.dataframe(
      df_products[
          ["name", "category", "buy_price", "sell_price", "unit", "stock"]
      ],
      use_container_width=True,
  )

elif menu == "বিক্রির ইতিহাস":
  st.title("📊 অতীতের বিক্রয় ও লাভ-ক্ষতির হিসাব")

  if len(st.session_state.sales) > 0:
    df_sales = pd.DataFrame(st.session_state.sales)
    st.dataframe(df_sales, use_container_width=True)

    total_profit = df_sales["Profit"].sum()
    st.success(f"💰 মোট সম্ভাব্য লাভ: ৳ {total_profit}")
  else:
    st.info("এখনো কোনো বিক্রির তথ্য যোগ করা হয়নি।")
