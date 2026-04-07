var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(o=> o.AddDefaultPolicy(p=>p.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()));
var app = builder.Build();
app.UseCors();

var crops = new List<Crop>();

app.MapGet("/", () => "Hello World!");

app.MapPost("/crops", (Crop crop) => {
    crop.Id = crops.Count + 1;
    crops.Add(crop);
    return Results.Ok(crop);
});

app.MapGet("/crops/{userName}", (string userName) => {
    return Results.Ok(crops.Where(c => c.UserName == userName).ToList());
});

app.MapDelete("/crops/{id}", (int id) => {  //I found that we use MapDelete to accept the delete request from out service.js file
    var crop = crops.FirstOrDefault(c => c.Id == id);
    crops.Remove(crop!);
    return Results.Ok(crop);
});

app.Run();

class Crop {
    public int Id { get; set; }
    public string UserName { get; set; }
    public string CropType { get; set; }
    public string PlantingDate { get; set; }
    public string FieldLocation { get; set; }
    public string Quantity { get; set; }
}
