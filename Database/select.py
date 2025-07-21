import sqlite3
conn = sqlite3.connect("sqlite.db")
sel = conn.execute("SELECT * from student")
for x in sel:
    print(x)