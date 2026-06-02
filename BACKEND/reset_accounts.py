import pymysql

conn = pymysql.connect(host='localhost', user='root', password='12345', database='nactvet_system')
cur = conn.cursor()
cur.execute('DROP TABLE IF EXISTS users')
cur.execute("DELETE FROM django_migrations WHERE app='accounts'")
conn.commit()
cur.close()
conn.close()
print('Dropped users table and reset accounts migration history.')
