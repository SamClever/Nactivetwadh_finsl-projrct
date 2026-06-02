import pymysql

conn = pymysql.connect(host='localhost', user='root', password='12345', database='nactvet_system')
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='nactvet_system' AND table_name LIKE '%user%' OR table_name LIKE '%institution%' OR table_name LIKE '%application%' OR table_name LIKE '%review%' OR table_name LIKE '%team%' OR table_name LIKE '%payment%' OR table_name LIKE '%document%' OR table_name LIKE '%certificate%' OR table_name LIKE '%inspection%'")
for row in cur.fetchall():
    print(row[0])
cur.close()
conn.close()
