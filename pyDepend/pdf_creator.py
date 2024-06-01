from flask import Blueprint, request, send_file, render_template_string
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io

pdf_creator = Blueprint('pdf_creator', __name__)

def create_pdf(title, name, age, message):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    c.setFont("Helvetica-Bold", 24)
    c.drawString(100, 750, title)
    
    c.setFont("Helvetica", 14)
    c.drawString(100, 700, f"Name: {name}")
    c.drawString(100, 675, f"Age: {age}")
    
    c.drawString(100, 650, "Message:")
    text = c.beginText(100, 625)
    text.setFont("Helvetica", 12)
    text.textLines(message)
    c.drawText(text)
    
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer

@pdf_creator.route('/create_pdf', methods=['GET', 'POST'])
def create_pdf_route():
    if request.method == 'POST':
        title = request.form.get('title', 'Sample PDF Document')
        name = request.form.get('name', 'John Doe')
        age = request.form.get('age', 30)
        message = request.form.get('message', 'This is a sample message to demonstrate PDF creation using reportlab.')
        
        buffer = create_pdf(title, name, age, message)
        
        return send_file(buffer, as_attachment=True, download_name='output.pdf', mimetype='application/pdf')
    
    return render_template_string('''
        <form method="post">
            Title: <input type="text" name="title"><br>
            Name: <input type="text" name="name"><br>
            Age: <input type="number" name="age"><br>
            Message: <textarea name="message"></textarea><br>
            <input type="submit" value="Create PDF">
        </form>
    ''')

