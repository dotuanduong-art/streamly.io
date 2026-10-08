using Microsoft.EntityFrameworkCore;
using Streamly.Api.Models;

namespace Streamly.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Movie> Movies { get; set; }

        public DbSet<Genre> Genres { get; set; }

        public DbSet<MovieGenre> MovieGenres { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<MyListItem> MyListItems { get; set; }
        public DbSet<WatchHistory> WatchHistories { get; set; }

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Movie
            modelBuilder.Entity<Movie>()
                .HasIndex(m => m.TmdbId)
                .IsUnique();

            modelBuilder.Entity<Movie>()
                .Property(m => m.Title)
                .IsRequired()
                .HasMaxLength(255);

            // Genre
            modelBuilder.Entity<Genre>()
                .HasIndex(g => g.Name)
                .IsUnique();

            modelBuilder.Entity<Genre>()
                .HasIndex(g => g.TmdbId)
                .IsUnique();

            // MovieGenre composite primary key
            modelBuilder.Entity<MovieGenre>()
                .HasKey(mg => new
                {
                    mg.MovieId,
                    mg.GenreId
                });
            modelBuilder.Entity<WatchHistory>()
                .HasKey(x => new { x.UserId, x.MovieId });

            modelBuilder.Entity<WatchHistory>()
                .HasOne(x => x.User)
                .WithMany(u => u.WatchHistories)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WatchHistory>()
                .HasOne(x => x.Movie)
                .WithMany(m => m.WatchHistories)
                .HasForeignKey(x => x.MovieId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MyListItem>()
                .HasKey(x => new { x.UserId, x.MovieId });

            modelBuilder.Entity<MyListItem>()
                .HasOne(x => x.User)
                .WithMany(u => u.MyListItems)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MyListItem>()
                .HasOne(x => x.Movie)
                .WithMany(m => m.MyListItems)
                .HasForeignKey(x => x.MovieId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MovieGenre>()
                .HasOne(mg => mg.Movie)
                .WithMany(m => m.MovieGenres)
                .HasForeignKey(mg => mg.MovieId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MovieGenre>()
                .HasOne(mg => mg.Genre)
                .WithMany(g => g.MovieGenres)
                .HasForeignKey(mg => mg.GenreId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(255);

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .IsRequired()
                .HasMaxLength(20);
        }
    }
}